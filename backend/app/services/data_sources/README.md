# Data Source Services

This package contains API clients for external data sources required by the FlowSight LSP Index.

## Available Clients

### 1. GlassnodeClient
- **Purpose:** On-chain intelligence metrics
- **Metrics:** SOPR, MVRV Ratios, Illiquid Supply Change, Stablecoin Ratio (SSR)
- **File:** `glassnode_client.py`
- **API Key Required:** Yes (Professional plan recommended)

### 2. CryptoQuantClient
- **Purpose:** Exchange flow and market intelligence
- **Metrics:** Exchange Net Flow, Whale Net Flow Momentum, Stablecoin Ratio
- **File:** `cryptoquant_client.py`
- **API Key Required:** Yes (Basic plan minimum)

### 3. BinanceClient
- **Purpose:** CEX order book depth
- **Metrics:** Order book depth, 2% and 5% price impact calculations
- **File:** `binance_client.py`
- **API Key Required:** No (public data)

### 4. CoinbaseClient
- **Purpose:** CEX order book depth (backup)
- **Metrics:** Order book depth, price impact calculations
- **File:** `coinbase_client.py`
- **API Key Required:** No (public data)

### 5. TheGraphClient
- **Purpose:** DEX liquidity data
- **Metrics:** DEX pool TVL, liquidity depth
- **File:** `thegraph_client.py`
- **API Key Required:** No (free tier available)

### 6. EtherscanClient
- **Purpose:** Ethereum transaction data
- **Metrics:** Large transactions (>$1M), transaction details
- **File:** `etherscan_client.py`
- **API Key Required:** Yes (free tier available)

## Usage Example

```python
from app.services.data_sources import GlassnodeClient, CryptoQuantClient

# Initialize clients
glassnode = GlassnodeClient()
cryptoquant = CryptoQuantClient()

# Fetch data
sopr = await glassnode.get_sopr(asset="BTC")
netflow = await cryptoquant.get_exchange_netflow(asset="BTC")

# Clean up
await glassnode.close()
await cryptoquant.close()
```

## Configuration

API keys are configured in `app/core/config.py` and loaded from environment variables:

```bash
GLASSNODE_API_KEY=your_key_here
CRYPTOQUANT_API_KEY=your_key_here
ETHERSCAN_API_KEY=your_key_here
```

## Error Handling

All clients implement graceful error handling:
- Returns `None` if API call fails
- Logs warnings/errors appropriately
- Falls back to mock data in ingestion pipeline if real data unavailable

## See Also

- `DATA_SOURCING_RECOMMENDATIONS.md` - Comprehensive guide on data sourcing
- `PT.md` lines 433-444 - Original requirements

