# FlowSight: The Oracle of Flow

<div align="center">

![FlowSight Logo](https://img.shields.io/badge/FlowSight-Oracle%20of%20Flow-00FFFF?style=for-the-badge&logo=ethereum&logoColor=white&color=0A1931)

**Predicting Crypto Liquidity Shocks. Decentrally.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Solidity](https://img.shields.io/badge/Solidity-363636?style=flat-square&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

</div>

---

## Vision

FlowSight is the leading institutional-grade, multi-chain prediction platform focused on real-time on-chain liquidity analysis and high-impact whale movements. We don't just track whales; we predict the **Liquidity Shock Prediction (LSP) Index**—the market impact of large capital flows *before* the price moves significantly.

## Unique Value Proposition

**The Problem:** Traders are often victims of **Liquidity Shocks**—sudden, massive price shifts caused by whales dumping tokens on an illiquid exchange or withdrawing capital from a major DeFi vault.

**FlowSight's Solution:** The **LSP Index** is a proprietary, real-time index that combines three distinct on-chain data points to generate an actionable score (e.g., -10 to +10) predicting the near-term volatility risk for an asset.

### Core Components

1. **On-Chain Velocity:** Tracking token movement volume and speed across centralized exchanges (CEXs), DEXs, and large private wallets.
2. **Liquidity Depth:** Real-time monitoring of 2% and 5% price impact depth on top DEX pools (e.g., Uniswap v3, Balancer) and CEX order books.
3. **Concentration Risk:** Calculating the percentage of a token's *liquid supply* held by the top 10 non-exchange wallets.

## Architecture

### Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | Next.js (React + TypeScript) | High-performance SSR dashboard with real-time updates |
| **Backend** | FastAPI (Python) | High-performance API serving and data processing |
| **ML Engine** | TensorFlow/PyTorch | LSTM models for LSP Index prediction |
| **Database** | PostgreSQL (TimescaleDB) | Time-series optimized data storage |
| **Real-time** | WebSockets (Socket.IO) | Live data streaming to frontend |
| **Message Queue** | Kafka/RabbitMQ | Reliable data pipeline streaming |
| **Smart Contracts** | Solidity (OpenZeppelin) | $FLOW token and staking/slashing contracts |
| **Containerization** | Docker | Scalable deployment architecture |

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.10+
- Docker and Docker Compose
- PostgreSQL 14+
- Hardhat (for smart contract development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flowsight
   ```

2. **Set up Smart Contracts**
   ```bash
   cd contracts
   npm install
   npx hardhat compile
   ```

3. **Set up Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Set up Frontend**
   ```bash
   cd frontend
   npm install
   ```

5. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Development

- **Backend API:** `http://localhost:8000`
- **Frontend:** `http://localhost:3000`
- **API Documentation:** `http://localhost:8000/docs`

## 📁 Project Structure

```
flowsight/
├── contracts/          # Solidity smart contracts
│   ├── contracts/      # $FLOW token and staking contracts
│   ├── scripts/        # Deployment scripts
│   └── test/           # Contract tests
├── backend/            # Python FastAPI backend
│   ├── app/
│   │   ├── api/        # API routes
│   │   ├── models/     # Database models
│   │   ├── services/   # Business logic
│   │   └── ml/         # ML models and training
│   ├── data_pipeline/  # Data ingestion scripts
│   └── requirements.txt
├── frontend/           # Next.js frontend
│   ├── src/
│   │   ├── app/        # Next.js app router
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom React hooks
│   │   └── lib/        # Utilities
│   └── package.json
├── docs/               # Documentation
│   └── TECHNICAL_DOC.md
└── docker-compose.yml
```

## Design System

**Theme:** Deep-Sea Surveillance & Financial Intelligence

- **Primary Color:** Deep Midnight Blue (`#0A1931`)
- **Secondary Color:** Electric Cyan (`#00FFFF`)
- **Accent:** White/Light Gray (`#F0F0F0`)
- **Typography:** Space Mono (headers), Inter (body)

## $FLOW Token

The native **$FLOW** utility token powers the FlowSight ecosystem:

- **Data Curation Staking:** Stake $FLOW to become a Curator and tag whale wallets
- **Premium Access:** Pay for premium subscriptions with $FLOW
- **Whale Alert Bidding:** Bid $FLOW to boost wallet alerts to the top
- **Governance:** Vote on platform decisions

**Tokenomics:**
- Total Supply: 1,000,000,000 FLOW (fixed, non-inflationary)
- Deflationary: API fees and bidding fees are burned

## Features

### MVP Features

- ✅ Real-time LSP Index calculation for BTC and ETH
- ✅ Whale Tracker Dashboard with top 10 identified wallets
- ✅ Real-time Alert Feed via WebSockets
- ✅ $FLOW ERC-20 token contract
- ✅ Curator Staking & Slashing contract
- ✅ Deep Midnight Blue / Electric Cyan UI theme

### Upcoming Features

- Multi-chain support (Polygon, BNB Chain, Solana)
- Advanced ML models with more features
- Institutional API access
- Mobile applications
- Tokenomics Risk Audit service

## Security

- Smart contracts audited by OpenZeppelin
- Secure WebSocket connections
- API rate limiting
- Input validation and sanitization
- Regular security audits

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Contact

- Website: [FlowSight.io](https://flowsight.io)
- Twitter: [@FlowSight](https://twitter.com/flowsight)
- Email: contact@flowsight.io

---

<div align="center">

**Built with ❤️ by the FlowSight Team**

*Predicting the future, one flow at a time.*

</div>

