"""
Binance API Client

Provides access to Binance exchange data:
- Order Book Depth (for 2% and 5% price impact calculation)
- WebSocket streams for real-time data
- Exchange flow data
"""

import aiohttp
import websockets
import json
from typing import Dict, Any, Optional, List
from loguru import logger
from app.core.config import settings


class BinanceClient:
    """
    Client for Binance API
    
    Documentation: https://binance-docs.github.io/apidocs
    """
    
    BASE_URL = "https://api.binance.com/api/v3"
    WS_URL = "wss://stream.binance.com:9443/ws"
    
    def __init__(self, api_key: Optional[str] = None, secret_key: Optional[str] = None):
        """
        Initialize Binance client
        
        Args:
            api_key: Binance API key (defaults to settings)
            secret_key: Binance secret key (defaults to settings)
        """
        self.api_key = api_key or settings.BINANCE_API_KEY
        self.secret_key = secret_key or settings.BINANCE_SECRET_KEY
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close(self):
        """Close the session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def get_order_book_depth(
        self,
        symbol: str = "BTCUSDT",
        limit: int = 5000
    ) -> Optional[Dict[str, Any]]:
        """
        Get order book depth
        
        Returns current order book with bids and asks.
        Used to calculate 2% and 5% price impact depth.
        
        Args:
            symbol: Trading pair (e.g., BTCUSDT, ETHUSDT)
            limit: Number of orders to return (max 5000)
            
        Returns:
            Order book data with bids and asks or None
        """
        try:
            session = await self._get_session()
            params = {
                "symbol": symbol,
                "limit": min(limit, 5000),
            }
            
            async with session.get(
                f"{self.BASE_URL}/depth",
                params=params
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data
                return None
        except Exception as e:
            logger.error(f"Error fetching order book from Binance: {e}")
            return None
    
    async def calculate_price_impact_depth(
        self,
        symbol: str = "BTCUSDT",
        impact_percent: float = 2.0
    ) -> Optional[float]:
        """
        Calculate liquidity depth at a specific price impact percentage
        
        This is a core LSP feature - measures how much liquidity
        is available at 2% and 5% price deviation.
        
        Args:
            symbol: Trading pair (e.g., BTCUSDT)
            impact_percent: Price impact percentage (2.0 or 5.0)
            
        Returns:
            Liquidity depth in USD or None
        """
        try:
            order_book = await self.get_order_book_depth(symbol)
            if not order_book:
                return None
            
            # Get current price (mid price from order book)
            bids = order_book.get("bids", [])
            asks = order_book.get("asks", [])
            
            if not bids or not asks:
                return None
            
            # Calculate mid price
            best_bid = float(bids[0][0])
            best_ask = float(asks[0][0])
            mid_price = (best_bid + best_ask) / 2
            
            # Calculate target price (impact_percent deviation)
            target_price = mid_price * (1 + impact_percent / 100)
            
            # Calculate depth (sum of orders up to target price)
            depth = 0.0
            for ask in asks:
                price = float(ask[0])
                quantity = float(ask[1])
                
                if price <= target_price:
                    depth += price * quantity
                else:
                    break
            
            return depth
        except Exception as e:
            logger.error(f"Error calculating price impact depth: {e}")
            return None
    
    async def get_exchange_flow(
        self,
        asset: str = "BTC"
    ) -> Optional[float]:
        """
        Get exchange flow data from Binance
        
        Measures net flow to/from Binance exchange.
        
        Args:
            asset: Asset symbol (BTC, ETH)
            
        Returns:
            Net flow value (negative = outflow) or None
        """
        # Note: Binance doesn't directly provide exchange flow data
        # This would need to be calculated from on-chain data
        # or use CryptoQuant API which aggregates Binance data
        logger.warning("Binance doesn't provide direct exchange flow API. Use CryptoQuant instead.")
        return None

