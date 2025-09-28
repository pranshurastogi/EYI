# ProofOfHuman Smart Contract (EYI)

This folder contains the on‑chain registry that records verified, ENS‑linked humans using the Self Protocol. The contract integrates with Self’s IdentityVerificationHub and exposes a simple, auditable registry that frontends can query for verification status and statistics.

Contract source is in `Self.sol` and is not modified by this setup.

## What The Contract Does

- Maintains a registry of verified users
  - `mapping(address => bool) public isVerified` — quick lookup for a wallet’s verification status
  - `address[] public verifiedUsers` — ordered list of all verified wallets
- Captures the last successful proof snapshot for transparency/debugging
  - `lastOutput`, `lastUserData`, `lastUserAddress`
- Enforces a verification policy configured at deployment
  - Uses `SelfUtils.formatVerificationConfigV2` and stores the resulting `verificationConfig` and its `verificationConfigId`
- Emits events for off‑chain indexing
  - `HumanVerified(address user)` when a new user is verified
  - `PolicyRegistered(bytes32 configId)` when the policy is registered with the Hub

### Lifecycle / Flow

1. Deployer provides the Self Hub address, a `scopeSeed` string (e.g. `"ens-demos"`), and an unformatted verification policy (age threshold, forbidden countries, OFAC toggle).
2. The constructor formats and registers this policy with Self’s Hub (`IIdentityVerificationHubV2`).
3. When a user proves compliance through the Hub, the Hub calls `customVerificationHook(...)` on this contract.
4. The hook:
   - Extracts the user address from the proof
   - Marks them `isVerified[user] = true` and appends to `verifiedUsers` if first‑time
   - Stores proof snapshot in `lastOutput/lastUserData/lastUserAddress`
   - Emits `HumanVerified(user)`
5. Frontends can fetch `getAllVerifiedUsers()` or `totalVerified()` for UI and analytics.

### Public Interface

- `getConfigId(...)` — Hub callback to select which policy to enforce (returns `verificationConfigId`).
- `getAllVerifiedUsers()` — returns the full list of verified addresses.
- `totalVerified()` — returns the count of verified users.

## Deployed Info

- Contract address: `0xE85B8De9B56d8ce4fCdF0cd7D5B083F7d92b4459`
- Scope: `15671803562065284577829638614320443496295144589562430240301924956264021871942`
- Explorer (logs): https://celo-sepolia.blockscout.com/address/0xE85B8De9B56d8ce4fCdF0cd7D5B083F7d92b4459?tab=logs

> Note: The above was deployed on Celo Sepolia. Network/RPC details may differ in your environment.

---

## Hardhat Setup (in this folder)

This subproject is a standalone Hardhat workspace scoped to the `contracts/` directory. The Solidity sources live at the root of this folder (we configured Hardhat’s `paths.sources = "./"`), so `Self.sol` remains untouched.

### Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)

### Install

```bash
cd contracts
npm install
```

This installs Hardhat and the Self Protocol contracts dependency `@selfxyz/contracts` used by `Self.sol` imports.

### Environment

Copy `.env.example` to `.env` and fill values as needed:

```bash
cp .env.example .env
```

Env keys:

- `CELO_SEPOLIA_URL` — RPC endpoint for Celo Sepolia (or your chosen network)
- `PRIVATE_KEY` — deployer EOA private key (no 0x prefix issues)
- `HUB_V2_ADDRESS` — Self IdentityVerificationHubV2 contract address for the target network
- `SCOPE_SEED` — string to scope verification (e.g. `ens-demos`)
- `OLDER_THAN` — minimum age requirement (number)
- `FORBIDDEN_COUNTRIES` — comma‑separated ISO‑3 country codes (e.g. `IRN,PRK`)
- `OFAC_ENABLED` — `true`/`false` toggle for OFAC screening

### Common Commands

```bash
# Clean, compile, test
npm run clean
npm run compile
npm run test

# Deploy locally (Hardhat Network)
npm run deploy:local

# Deploy to Celo Sepolia (requires .env)
npm run deploy
```

### Deploy Script

- `scripts/deploy.js` reads constructor args from `.env` and deploys `ProofOfHuman`.
- For local testing, it falls back to safe defaults (e.g. zero Hub address), so compilation works without external infra.

### Notes on Verification

- This project doesn’t include an automatic Etherscan/Blockscout verification step.
- You can verify using Blockscout’s UI by uploading the flattened source or by configuring a verification plugin later if needed.

## Security Considerations

- The registry only records that a wallet passed the configured checks; it stores no PII.
- Policy design matters. Age thresholds, forbidden countries, and OFAC toggles should reflect your compliance needs.
- Events (`HumanVerified`, `PolicyRegistered`) are emitted for indexing/analytics—consume them from your indexer or frontend as needed.

## File Layout

- `Self.sol` — the `ProofOfHuman` contract integrating with Self Protocol
- `hardhat.config.js` — Hardhat config pointing sources to `./` and setting Solidity `0.8.28`
- `scripts/deploy.js` — deployment helper that reads env and deploys the contract
- `.env.example` — template for environment variables
- `.gitignore` — ignores `artifacts/`, `cache/`, `node_modules/` and `.env`

---

If you need me to add a network verification step or wire in additional scripts (migrations, policy updates, etc.), let me know and I’ll extend this setup.
