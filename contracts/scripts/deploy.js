/*
  Deploy script for ProofOfHuman
  Usage:
    - Local:    npx hardhat run scripts/deploy.js
    - Celo Sepolia: npx hardhat run scripts/deploy.js --network celoSepolia

  Required env (for non-hardhat networks):
    PRIVATE_KEY=0x...
    CELO_SEPOLIA_URL=https://...

  Contract constructor args via env (with sensible defaults for testing):
    HUB_V2_ADDRESS=0x...
    SCOPE_SEED=ens-demos
    OLDER_THAN=13
    FORBIDDEN_COUNTRIES=IRN,PRK (comma-separated ISO-3 codes)
    OFAC_ENABLED=true
*/
require('dotenv').config();
const { ethers } = require('hardhat');

function parseBool(v, def = false) {
  if (v === undefined) return def;
  return String(v).toLowerCase() === 'true';
}

function parseCountries(csv) {
  if (!csv) return [];
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function main() {
  const hubV2 = process.env.HUB_V2_ADDRESS || ethers.ZeroAddress;
  const scopeSeed = process.env.SCOPE_SEED || 'ens-demos';
  const olderThan = Number(process.env.OLDER_THAN ?? 13);
  const forbiddenCountries = parseCountries(process.env.FORBIDDEN_COUNTRIES || '');
  const ofacEnabled = parseBool(process.env.OFAC_ENABLED, true);

  if (hubV2 === ethers.ZeroAddress) {
    console.warn('[warn] HUB_V2_ADDRESS not set; using zero address for local deploys.');
  }

  const cfg = { olderThan, forbiddenCountries, ofacEnabled };

  console.log('Deploying ProofOfHuman with config:', {
    hubV2,
    scopeSeed,
    cfg
  });

  const ProofOfHuman = await ethers.getContractFactory('ProofOfHuman');
  const contract = await ProofOfHuman.deploy(hubV2, scopeSeed, cfg);
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log('ProofOfHuman deployed to:', address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

