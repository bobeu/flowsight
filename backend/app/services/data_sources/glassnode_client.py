"""
Glassnode API Client

Provides access to Glassnode's on-chain analytics:
- SOPR (Spent Output Profit Ratio)
- MVRV Ratios
- Illiquid Supply Change
- Stablecoin Ratio (SSR)
"""

import aiohttp
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from loguru import logger
from app.core.config import settings


class GlassnodeClient:
    """
    Client for Glassnode API
    
    Documentation: https://docs.glassnode.com
    """
    
    BASE_URL = "https://api.glassnode.com/v1/metrics"
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Glassnode client
        
        Args:
            api_key: Glassnode API key (defaults to settings)
        """
        self.api_key = api_key or settings.GLASSNODE_API_KEY
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
    
    async def get_sopr(
        self,
        asset: str = "BTC",
        resolution: str = "24h",
        since: Optional[datetime] = None,
        until: Optional[datetime] = None
    ) -> Optional[float]:
        """
        Get Spent Output Profit Ratio (SOPR)
        
        SOPR measures the profit/loss ratio of spent outputs.
        Values close to 1 indicate capitulation.
        
        Args:
            asset: Asset symbol (BTC, ETH)
            resolution: Time resolution (1h, 24h, 1w)
            since: Start timestamp
            until: End timestamp
            
        Returns:
            Current SOPR value or None if unavailable
        """
        if not self.api_key:
            logger.warning("Glassnode API key not configured, returning mock SOPR")
            return 1.05  # Mock value
        
        try:
            session = await self._get_session()
            params = {
                "a": asset,
                "i": resolution,
                "api_key": self.api_key,
            }
            
            if since:
                params["s"] = int(since.timestamp())
            if until:
                params["u"] = int(until.timestamp())
            
            async with session.get(
                # f"{self.BASE_URL}/indicators/sopr",
                f"{self.BASE_URL}/indicators/sopr_adjusted",
                params=params
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data and len(data) > 0:
                        # Return most recent value
                        return float(data[-1].get("v", 1.0))
                else:
                    logger.error(f"Glassnode API error: {response.status}")
                    return None
        except Exception as e:
            logger.error(f"Error fetching SOPR from Glassnode: {e}")
            return None
    
    async def get_mvrv_ratio(
        self,
        asset: str = "BTC",
        resolution: str = "24h"
    ) -> Optional[float]:
        """
        Get MVRV (Market Value to Realized Value) Ratio
        
        MVRV compares market cap to realized cap.
        High values indicate potential overvaluation.
        
        Args:
            asset: Asset symbol (BTC, ETH)
            resolution: Time resolution
            
        Returns:
            Current MVRV ratio or None
        """
        if not self.api_key:
            logger.warning("Glassnode API key not configured, returning mock MVRV")
            return 2.5  # Mock value
        
        try:
            session = await self._get_session()
            params = {
                "a": asset,
                "i": resolution,
                "api_key": self.api_key,
            }
            
            async with session.get(
                f"{self.BASE_URL}/indicators/mvrv",
                params=params
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data and len(data) > 0:
                        return float(data[-1].get("v", 2.0))
                return None
        except Exception as e:
            logger.error(f"Error fetching MVRV from Glassnode: {e}")
            return None
    
    async def get_illiquid_supply_change(
        self,
        asset: str = "BTC",
        resolution: str = "24h"
    ) -> Optional[float]:
        """
        Get Illiquid Supply Change
        
        Measures the rate at which coins move into long-term custody.
        Positive values indicate accumulation (bullish).
        
        Args:
            asset: Asset symbol (BTC, ETH)
            resolution: Time resolution
            
        Returns:
            Illiquid supply change (percentage or absolute) or None
        """
        if not self.api_key:
            logger.warning("Glassnode API key not configured, returning mock illiquid supply change")
            return 0.5  # Mock value
        
        try:
            session = await self._get_session()
            params = {
                "a": asset,
                "i": resolution,
                "api_key": self.api_key,
            }
            
            async with session.get(
                f"{self.BASE_URL}/supply/illiquid",
                params=params
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data and len(data) > 1:
                        # Calculate change from previous period
                        current = float(data[-1].get("v", 0))
                        previous = float(data[-2].get("v", 0))
                        return current - previous
                return None
        except Exception as e:
            logger.error(f"Error fetching illiquid supply change from Glassnode: {e}")
            return None
    
    async def get_stablecoin_ratio(
        self,
        asset: str = "BTC",
        resolution: str = "24h"
    ) -> Optional[float]:
        """
        Get Stablecoin Supply Ratio (SSR)
        
        Measures buying power (stablecoins) relative to native coin supply.
        High SSR indicates accumulation ready to deploy (bullish).
        
        Args:
            asset: Asset symbol (BTC, ETH)
            resolution: Time resolution
            
        Returns:
            Stablecoin ratio or None
        """
        if not self.api_key:
            logger.warning("Glassnode API key not configured, returning mock SSR")
            return 0.6  # Mock value
        
        try:
            session = await self._get_session()
            params = {
                "a": asset,
                "i": resolution,
                "api_key": self.api_key,
            }
            
            async with session.get(
                f"{self.BASE_URL}/indicators/ssr",
                params=params
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data and len(data) > 0:
                        return float(data[-1].get("v", 0.5))
                return None
        except Exception as e:
            logger.error(f"Error fetching SSR from Glassnode: {e}")
            return None

