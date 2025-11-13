"""
Etherscan API Client

Provides access to Ethereum blockchain data:
- Large transaction monitoring (>$1M USD)
- Transaction history
- Address information
"""

import aiohttp
from typing import Dict, Any, Optional, List
from datetime import datetime
from loguru import logger
from app.core.config import settings


class EtherscanClient:
    """
    Client for Etherscan API
    
    Documentation: https://docs.etherscan.io
    """
    
    BASE_URL = "https://api.etherscan.io/api"
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Etherscan client
        
        Args:
            api_key: Etherscan API key (defaults to settings)
        """
        self.api_key = api_key or settings.ETHERSCAN_API_KEY
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
    
    async def get_large_transactions(
        self,
        min_value_eth: float = 100.0,  # ~$1M USD at current prices
        start_block: Optional[int] = None,
        end_block: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Get large transactions (for whale alerts)
        
        Args:
            min_value_eth: Minimum transaction value in ETH
            start_block: Start block number (optional)
            end_block: End block number (optional)
            
        Returns:
            List of large transactions
        """
        if not self.api_key:
            logger.warning("Etherscan API key not configured, returning empty list")
            return []
        
        try:
            session = await self._get_session()
            params = {
                "module": "account",
                "action": "txlist",
                "startblock": start_block or 0,
                "endblock": end_block or 99999999,
                "sort": "desc",
                "apikey": self.api_key,
            }
            
            # Note: Etherscan doesn't directly filter by value
            # We'll need to fetch and filter client-side
            # For production, consider using WebSocket streams or specialized services
            
            transactions = []
            # This is a simplified example - real implementation would need
            # to handle pagination and filtering
            
            return transactions
        except Exception as e:
            logger.error(f"Error fetching large transactions from Etherscan: {e}")
            return []
    
    async def get_transaction_by_hash(
        self,
        tx_hash: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get transaction details by hash
        
        Args:
            tx_hash: Transaction hash
            
        Returns:
            Transaction data or None
        """
        if not self.api_key:
            return None
        
        try:
            session = await self._get_session()
            params = {
                "module": "proxy",
                "action": "eth_getTransactionByHash",
                "txhash": tx_hash,
                "apikey": self.api_key,
            }
            
            async with session.get(self.BASE_URL, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("status") == "1":
                        return data.get("result")
                return None
        except Exception as e:
            logger.error(f"Error fetching transaction from Etherscan: {e}")
            return None

