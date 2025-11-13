"""
The Graph API Client

Provides access to The Graph's decentralized indexing:
- DEX Liquidity Depth (Uniswap, Curve, PancakeSwap)
- TVL (Total Value Locked) in DEX pools
"""

import aiohttp
from typing import Dict, Any, Optional, List
from loguru import logger


class TheGraphClient:
    """
    Client for The Graph API
    
    Documentation: https://thegraph.com/docs
    """
    
    # Common subgraph endpoints
    UNISWAP_V3_SUBGRAPH = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"
    CURVE_SUBGRAPH = "https://api.thegraph.com/subgraphs/name/curvefi/curve"
    PANCAKESWAP_V3_SUBGRAPH = "https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc"
    
    def __init__(self, subgraph_url: Optional[str] = None):
        """
        Initialize The Graph client
        
        Args:
            subgraph_url: Custom subgraph URL (defaults to Uniswap V3)
        """
        self.subgraph_url = subgraph_url or self.UNISWAP_V3_SUBGRAPH
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
    
    async def query_subgraph(
        self,
        query: str,
        variables: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Execute a GraphQL query against The Graph subgraph
        
        Args:
            query: GraphQL query string
            variables: Query variables
            
        Returns:
            Query result or None
        """
        try:
            session = await self._get_session()
            payload = {
                "query": query,
            }
            
            if variables:
                payload["variables"] = variables
            
            async with session.post(
                self.subgraph_url,
                json=payload
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if "errors" in data:
                        logger.error(f"The Graph query errors: {data['errors']}")
                        return None
                    return data.get("data")
                return None
        except Exception as e:
            logger.error(f"Error querying The Graph: {e}")
            return None
    
    async def get_pool_liquidity(
        self,
        pool_address: Optional[str] = None,
        token0: Optional[str] = None,
        token1: Optional[str] = None
    ) -> Optional[float]:
        """
        Get DEX pool liquidity (TVL)
        
        Args:
            pool_address: Specific pool address (optional)
            token0: First token address (optional)
            token1: Second token address (optional)
            
        Returns:
            Pool liquidity in USD or None
        """
        if pool_address:
            query = """
            query GetPool($poolId: ID!) {
                pool(id: $poolId) {
                    totalValueLockedUSD
                    liquidity
                }
            }
            """
            variables = {"poolId": pool_address.lower()}
        elif token0 and token1:
            query = """
            query GetPoolByTokens($token0: String!, $token1: String!) {
                pools(
                    where: {
                        token0: $token0,
                        token1: $token1
                    },
                    orderBy: totalValueLockedUSD,
                    orderDirection: desc,
                    first: 1
                ) {
                    totalValueLockedUSD
                    liquidity
                }
            }
            """
            variables = {
                "token0": token0.lower(),
                "token1": token1.lower()
            }
        else:
            logger.error("Either pool_address or both token0 and token1 must be provided")
            return None
        
        try:
            result = await self.query_subgraph(query, variables)
            if result and "pool" in result:
                pool = result["pool"]
                return float(pool.get("totalValueLockedUSD", 0))
            elif result and "pools" in result and len(result["pools"]) > 0:
                pool = result["pools"][0]
                return float(pool.get("totalValueLockedUSD", 0))
            return None
        except Exception as e:
            logger.error(f"Error getting pool liquidity: {e}")
            return None
    
    async def get_dex_liquidity_depth(
        self,
        token_address: str,
        impact_percent: float = 5.0
    ) -> Optional[float]:
        """
        Get DEX liquidity depth at a specific price impact
        
        This is a core LSP feature for altcoins.
        
        Args:
            token_address: Token contract address
            impact_percent: Price impact percentage (default 5%)
            
        Returns:
            Liquidity depth in USD or None
        """
        # This would require more complex calculations based on pool reserves
        # and price impact formulas. For MVP, we return TVL as approximation.
        logger.warning("DEX liquidity depth calculation requires complex pool math. Returning TVL approximation.")
        return await self.get_pool_liquidity(token0=token_address)

