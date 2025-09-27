const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

function runSubstreams(args, envOverrides = {}) {
  return new Promise((resolve) => {
    const child = spawn('substreams', args, { env: { ...process.env, ...envOverrides } })
    let stdoutBuf = ''
    let stderrBuf = ''
    child.stdout.on('data', (d) => (stdoutBuf += d.toString()))
    child.stderr.on('data', (d) => (stderrBuf += d.toString()))
    child.on('error', (err) => resolve({ code: -1, stdout: stdoutBuf, stderr: `${stderrBuf}\n${err.message}` }))
    child.on('close', (code) => resolve({ code, stdout: stdoutBuf, stderr: stderrBuf }))
  })
}

async function getInfo(req, res) {
  const endpoint = String(process.env.SUBSTREAMS_ENDPOINT || 'mainnet.eth.streamingfast.io:443')
  const pkg = String(process.env.SUBSTREAMS_PACKAGE || 'ethereum-explorer@latest')
  const args = ['info', pkg]
  const result = await runSubstreams(args, { SUBSTREAMS_ENDPOINT: endpoint })
  res.status(result.code === 0 ? 200 : 500).json({
    endpoint,
    package: pkg,
    code: result.code,
    stdout: result.stdout,
    stderr: result.stderr,
    triedCommand: `SUBSTREAMS_ENDPOINT=${endpoint} substreams ${args.join(' ')}`,
  })
}

async function runStream(req, res) {
  const { wallet } = req.body || {}
  if (!wallet) return res.status(400).json({ error: 'Missing wallet' })

  const addr = String(wallet).toLowerCase()
  if (!/^0x[0-9a-f]{40}$/.test(addr)) return res.status(400).json({ error: 'Invalid wallet', wallet })

  const direction = String((req.body && req.body.direction) || 'from').toLowerCase() === 'to' ? 'to' : 'from'
  const startBlock = String((req.body && req.body.startBlock) || process.env.SUBSTREAMS_START_BLOCK || '0')
  const stopBlock = String((req.body && req.body.stopBlock) || process.env.SUBSTREAMS_STOP_BLOCK || '+500')
  const endpoint = String((req.body && req.body.endpoint) || process.env.SUBSTREAMS_ENDPOINT || 'mainnet.eth.streamingfast.io:443')
  const pkg = String((req.body && req.body.pkg) || process.env.SUBSTREAMS_PACKAGE || 'ethereum-explorer@latest')
  const moduleName = String((req.body && req.body.module) || process.env.SUBSTREAMS_MODULE || 'map_filter_transactions')

  const args = [
    'run',
    pkg,
    moduleName,
    '--params', `${moduleName}=${direction}=${addr}`,
    '--start-block', startBlock,
    '--stop-block', stopBlock,
  ]

  const result = await runSubstreams(args, { SUBSTREAMS_ENDPOINT: endpoint })
  if (result.code !== 0) {
    const info = await runSubstreams(['info', pkg], { SUBSTREAMS_ENDPOINT: endpoint })
    return res.status(500).json({
      error: `Substreams process exited with code ${result.code}`,
      stdout: result.stdout.trim() || undefined,
      stderr: result.stderr.trim() || undefined,
      triedCommand: `SUBSTREAMS_ENDPOINT=${endpoint} substreams ${args.join(' ')}`,
      endpoint,
      package: pkg,
      module: moduleName,
      direction,
      info: {
        code: info.code,
        stdout: info.stdout?.trim() || undefined,
        stderr: info.stderr?.trim() || undefined,
        triedCommand: `SUBSTREAMS_ENDPOINT=${endpoint} substreams info ${pkg}`,
      },
    })
  }

  const publicDir = path.join(__dirname, '..', 'public')
  await fs.promises.mkdir(publicDir, { recursive: true })

  let contents = (result.stdout || '').trim()
  if (!contents) {
    const err = (result.stderr || '').trim()
    contents = err || [
      'No output produced by Substreams for the given parameters.',
      `Wallet: ${addr}`,
      `Module: ${moduleName}`,
      `Direction: ${direction}`,
      `Start block: ${startBlock}`,
      `Stop block: ${stopBlock}`,
    ].join('\n')
  }

  const fileName = `${addr}.txt`
  const filePath = path.join(publicDir, fileName)
  await fs.promises.writeFile(filePath, contents, 'utf8')

  res.json({ data: contents, file: `/static/${fileName}` })
}

module.exports = { getInfo, runStream }

