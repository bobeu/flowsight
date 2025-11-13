# FlowSight Smart Contracts

This directory contains the Solidity smart contracts for the FlowSight platform.

## Contracts

### FLOWToken.sol
ERC-20 token contract for the $FLOW token.
- Fixed supply: 1,000,000,000 FLOW
- Supports burning, pausing, and batch minting
- Uses OpenZeppelin contracts for security

### CuratorStaking.sol
Staking contract for FlowSight Curators.
- Minimum stake: 10,000 FLOW
- Slashing mechanism: 5% for bad actors
- Reward distribution from API revenue
- Governance voting rights

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Add your private key and RPC URLs to `.env`

## Compile

```bash
npm run compile
```

## Test

```bash
npm test
```

## Deploy

### Local Network
```bash
npx hardhat node
npm run deploy:local
```

### Sepolia Testnet
```bash
npm run deploy:sepolia
```

## Security

- Contracts use OpenZeppelin's battle-tested libraries
- ReentrancyGuard protection
- Pausable for emergency stops
- Access control via Ownable

## License

MIT

