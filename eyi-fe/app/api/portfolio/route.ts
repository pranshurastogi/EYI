import { NextResponse } from 'next/server'

type NetworkKey = 'eth-mainnet'

function getExplorerConfig() {
  return { baseUrl: 'https://api.etherscan.io/api', apiKey: process.env.ETHERSCAN_API_KEY }
}

interface EtherscanListResponse<T> {
  status: string
  message: string
  result: T
}

interface NormalTx {
  blockNumber: string
  timeStamp: string
  hash: string
  nonce: string
  blockHash: string
  transactionIndex: string
  from: string
  to: string
  value: string
  gas: string
  gasPrice: string
  isError?: string
  txreceipt_status?: string
  input?: string
  contractAddress?: string
  cumulativeGasUsed?: string
  gasUsed?: string
}

interface InternalTx {
  type?: string
  from: string
  to: string
  value: string
  gas: string
  gasUsed?: string
  isError?: string
  input?: string
  traceId?: string
  errCode?: string
  timeStamp?: string
  hash?: string
}

interface TokenTx {
  blockNumber: string
  timeStamp: string
  hash: string
  nonce: string
  blockHash: string
  from: string
  contractAddress: string
  to: string
  value: string
  tokenName: string
  tokenSymbol: string
  tokenDecimal: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = (searchParams.get('address') || '').trim()
    const network = (searchParams.get('network') as NetworkKey) || 'eth-mainnet'
    const limitParam = searchParams.get('limit')
    const limit = Math.max(1, Math.min(100, limitParam ? parseInt(limitParam) : 50))

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: 'Invalid or missing address' }, { status: 400 })
    }

    // Only Ethereum mainnet is supported via Etherscan
    if (network !== 'eth-mainnet') {
      return NextResponse.json({ error: 'Only Ethereum mainnet is supported.' }, { status: 400 })
    }

    const { baseUrl, apiKey } = getExplorerConfig()

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ETHERSCAN_API_KEY not configured. Please set it in eyi-fe/.env.local.' },
        { status: 500 }
      )
    }

    const qs = (params: Record<string, string | number>) =>
      Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')

    const txlistUrl = `${baseUrl}?${qs({
      module: 'account',
      action: 'txlist',
      address,
      startblock: 0,
      endblock: 99999999,
      page: 1,
      offset: limit,
      sort: 'desc',
      apikey: apiKey,
    })}`

    const internalsUrl = `${baseUrl}?${qs({
      module: 'account',
      action: 'txlistinternal',
      address,
      startblock: 0,
      endblock: 99999999,
      page: 1,
      offset: limit,
      sort: 'desc',
      apikey: apiKey,
    })}`

    const tokenTxUrl = `${baseUrl}?${qs({
      module: 'account',
      action: 'tokentx',
      address,
      startblock: 0,
      endblock: 99999999,
      page: 1,
      offset: limit,
      sort: 'desc',
      apikey: apiKey,
    })}`

    const [txRes, internalsRes, tokenRes] = await Promise.all([
      fetch(txlistUrl, { next: { revalidate: 60 } }),
      fetch(internalsUrl, { next: { revalidate: 60 } }),
      fetch(tokenTxUrl, { next: { revalidate: 60 } }),
    ])

    if (!txRes.ok) {
      const text = await txRes.text()
      return NextResponse.json({ error: `Etherscan txlist failed: ${txRes.status} ${text}` }, { status: 502 })
    }

    // Note: Etherscan returns status "0" with message "No transactions found" for empty results
    const txJson = (await txRes.json()) as EtherscanListResponse<NormalTx[]>
    const internalsJson = internalsRes.ok ? ((await internalsRes.json()) as EtherscanListResponse<InternalTx[]>) : { status: '0', message: 'N/A', result: [] }
    const tokenJson = tokenRes.ok ? ((await tokenRes.json()) as EtherscanListResponse<TokenTx[]>) : { status: '0', message: 'N/A', result: [] }

    const normalTxs: NormalTx[] = Array.isArray(txJson.result) ? txJson.result : []
    const internalTxs: InternalTx[] = Array.isArray(internalsJson.result) ? internalsJson.result : []
    const tokenTxs: TokenTx[] = Array.isArray(tokenJson.result) ? tokenJson.result : []

    // Index internals by parent hash
    const internalsByHash = new Map<string, InternalTx[]>()
    for (const itx of internalTxs) {
      const h = itx.hash || ''
      if (!internalsByHash.has(h)) internalsByHash.set(h, [])
      internalsByHash.get(h)!.push(itx)
    }

    // Index token tx by parent hash to tag contract interactions
    const tokenByHash = new Map<string, TokenTx[]>()
    for (const t of tokenTxs) {
      if (!tokenByHash.has(t.hash)) tokenByHash.set(t.hash, [])
      tokenByHash.get(t.hash)!.push(t)
    }

    // Map to frontend Transaction shape
    const transactions = normalTxs.map((tx) => {
      const internal = internalsByHash.get(tx.hash) || []
      const tokenEvents = tokenByHash.get(tx.hash) || []
      const inferredContract = tx.contractAddress && tx.contractAddress !== '' ? tx.contractAddress : (tokenEvents[0]?.contractAddress || undefined)

      return {
        network,
        hash: tx.hash,
        timeStamp: tx.timeStamp,
        blockNumber: Number(tx.blockNumber),
        blockHash: tx.blockHash,
        nonce: Number(tx.nonce),
        transactionIndex: Number(tx.transactionIndex),
        fromAddress: tx.from,
        toAddress: tx.to,
        contractAddress: inferredContract,
        value: tx.value,
        cumulativeGasUsed: tx.cumulativeGasUsed || '0',
        effectiveGasPrice: tx.gasPrice || '0',
        gasUsed: tx.gasUsed || tx.gas || '0',
        logs: [],
        internalTxns: internal.map((i) => ({
          type: i.type || 'call',
          fromAddress: i.from,
          toAddress: i.to,
          value: i.value,
          gas: i.gas,
          gasUsed: i.gasUsed || '0',
          input: i.input || '',
          output: '',
          error: i.isError === '1' ? (i.errCode || 'error') : undefined,
          revertReason: undefined,
        })),
      }
    })

    return NextResponse.json({ transactions, totalCount: transactions.length })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}
