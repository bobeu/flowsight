"""
Coinbase Pro API Client

Provides access to Coinbase Pro exchange data:
- Order Book Depth (for 2% and 5% price impact calculation)
"""

import aiohttp
from typing import Dict, Any, Optional
from loguru import logger


class CoinbaseClient:
    """
    Client for Coinbase Pro API
    
    Documentation: https://docs.pro.coinbase.com
    """
    
    BASE_URL = "https://api.pro.coinbase.com"
    
    def __init__(self):
        """Initialize Coinbase client"""
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
    
    async def get_order_book(
        self,
        product_id: str = "BTC-USD",
        level: int = 3
    ) -> Optional[Dict[str, Any]]:
        """
        Get order book
        
        Args:
            product_id: Trading pair (e.g., BTC-USD, ETH-USD)
            level: Order book level (1, 2, or 3)
            
        Returns:
            Order book data or None
        """
        try:
            session = await self._get_session()
            params = {"level": level}
            
            async with session.get(
                f"{self.BASE_URL}/products/{product_id}/book",
                params=params
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data
                return None
        except Exception as e:
            logger.error(f"Error fetching order book from Coinbase: {e}")
            return None
    
    async def calculate_price_impact_depth(
        self,
        product_id: str = "BTC-USD",
        impact_percent: float = 2.0
    ) -> Optional[float]:
        """
        Calculate liquidity depth at a specific price impact percentage
        
        Args:
            product_id: Trading pair (e.g., BTC-USD)
            impact_percent: Price impact percentage (2.0 or 5.0)
            
        Returns:
            Liquidity depth in USD or None
        """
        try:
            order_book = await self.get_order_book(product_id, level=3)
            if not order_book:
                return None
            
            # Get current price
            bids = order_book.get("bids", [])
            asks = order_book.get("asks", [])
            
            if not bids or not asks:
                return None
            
            best_bid = float(bids[0][0])
            best_ask = float(asks[0][0])
            mid_price = (best_bid + best_ask) / 2
            
            # Calculate target price
            target_price = mid_price * (1 + impact_percent / 100)
            
            # Calculate depth
            depth = 0.0
            for ask in asks:
                price = float(ask[0])
                size = float(ask[1])
                
                if price <= target_price:
                    depth += price * size
                else:
                    break
            
            return depth
        except Exception as e:
            logger.error(f"Error calculating price impact depth from Coinbase: {e}")
            return None

