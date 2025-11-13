"""
CryptoQuant API Client

Provides access to CryptoQuant's exchange flow and market intelligence:
- Exchange Net Flow (Whale Net Flow Momentum)
- Stablecoin Ratio
- Exchange Reserves
"""

import aiohttp
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from loguru import logger
from app.core.config import settings


class CryptoQuantClient:
    """
    Client for CryptoQuant API
    
    Documentation: https://cryptoquant.com/api
    """
    
    BASE_URL = "https://api.cryptoquant.com/v1"
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize CryptoQuant client
        
        Args:
            api_key: CryptoQuant API key (defaults to settings)
        """
        self.api_key = api_key or settings.CRYPTOQUANT_API_KEY
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
    
    async def get_exchange_netflow(
        self,
        asset: str = "BTC",
        exchange: Optional[str] = None,
        since: Optional[datetime] = None
    ) -> Optional[float]:
        """
        Get Exchange Net Flow
        
        Measures the net flow of tokens to/from exchanges.
        Negative values indicate outflow (bullish accumulation).
        
        Args:
            asset: Asset symbol (BTC, ETH)
            exchange: Specific exchange (optional, None = all exchanges)
            since: Start timestamp (defaults to 24h ago)
            
        Returns:
            Net flow value (can be negative) or None
        """
        if not self.api_key:
            logger.warning("CryptoQuant API key not configured, returning mock netflow")
            return -500.0  # Mock value (outflow)
        
        try:
            session = await self._get_session()
            params = {
                "market": asset.lower(),
                "api_key": self.api_key,
            }
            
            if exchange:
                params["exchange"] = exchange.lower()
            
            if since:
                params["since"] = int(since.timestamp())
            else:
                # Default to 24h ago
                params["since"] = int((datetime.utcnow() - timedelta(hours=24)).timestamp())
            
            async with session.get(
                f"{self.BASE_URL}/exchange/netflow",
                params=params
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data and "result" in data and len(data["result"]) > 0:
                        # Return most recent netflow
                        return float(data["result"][-1].get("netflow", 0.0))
                return None
        except Exception as e:
            logger.error(f"Error fetching exchange netflow from CryptoQuant: {e}")
            return None
    
    async def get_exchange_netflow_momentum(
        self,
        asset: str = "BTC",
        exchange: Optional[str] = None
    ) -> Optional[float]:
        """
        Get Exchange Net Flow Momentum
        
        Calculates the rate of change in net flow (velocity).
        This is a core LSP feature.
        
        Args:
            asset: Asset symbol (BTC, ETH)
            exchange: Specific exchange (optional)
            
        Returns:
            Net flow momentum (rate of change) or None
        """
        if not self.api_key:
            logger.warning("CryptoQuant API key not configured, returning mock momentum")
            return -0.5  # Mock value
        
        try:
            # Get current and previous netflow to calculate momentum
            now = datetime.utcnow()
            current_netflow = await self.get_exchange_netflow(asset, exchange, since=now - timedelta(hours=1))
            previous_netflow = await self.get_exchange_netflow(asset, exchange, since=now - timedelta(hours=2))
            
            if current_netflow is not None and previous_netflow is not None:
                # Calculate rate of change
                momentum = current_netflow - previous_netflow
                return momentum
            return None
        except Exception as e:
            logger.error(f"Error calculating netflow momentum: {e}")
            return None
    
    async def get_stablecoin_ratio(
        self,
        asset: str = "BTC"
    ) -> Optional[float]:
        """
        Get Stablecoin Ratio
        
        Measures available "dry powder" on exchanges.
        
        Args:
            asset: Asset symbol (BTC, ETH)
            
        Returns:
            Stablecoin ratio or None
        """
        if not self.api_key:
            logger.warning("CryptoQuant API key not configured, returning mock stablecoin ratio")
            return 0.6  # Mock value
        
        try:
            session = await self._get_session()
            params = {
                "market": asset.lower(),
                "api_key": self.api_key,
            }
            
            async with session.get(
                f"{self.BASE_URL}/market/stablecoin-ratio",
                params=params
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data and "result" in data and len(data["result"]) > 0:
                        return float(data["result"][-1].get("ratio", 0.5))
                return None
        except Exception as e:
            logger.error(f"Error fetching stablecoin ratio from CryptoQuant: {e}")
            return None

