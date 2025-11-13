"""
LSP (Liquidity Shock Prediction) Service

This service handles LSP score calculation, retrieval, and model inference.
Integrates with the ML model to generate predictions.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime
from typing import Optional
from app.models.models import LSPScore
from app.services.ml_service import MLService
from loguru import logger


class LSPService:
    """
    Service for LSP score management and calculation
    """
    
    def __init__(self, db: AsyncSession):
        """
        Initialize LSP service
        
        Args:
            db: Database session
        """
        self.db = db
        self.ml_service = MLService()
    
    async def get_current_score(self, asset: str) -> Optional[LSPScore]:
        """
        Get the most recent LSP score for an asset
        
        Args:
            asset: Asset symbol (BTC, ETH, etc.)
            
        Returns:
            LSPScore or None if no score exists
        """
        stmt = select(LSPScore).where(
            LSPScore.asset_symbol == asset.upper()
        ).order_by(desc(LSPScore.timestamp)).limit(1)
        
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def calculate_and_store_score(self, asset: str, features: dict) -> LSPScore:
        """
        Calculate LSP score using ML model and store in database
        
        Args:
            asset: Asset symbol
            features: Input features for the model
            
        Returns:
            Created LSPScore object
        """
        # Get prediction from ML model
        score = await self.ml_service.predict_lsp(features)
        
        # Create and store score
        lsp_score = LSPScore(
            asset_symbol=asset.upper(),
            score=score,
            timestamp=datetime.utcnow(),
            features=str(features)  # Store as JSON string
        )
        
        self.db.add(lsp_score)
        await self.db.commit()
        await self.db.refresh(lsp_score)
        
        logger.info(f"LSP score calculated for {asset}: {score}")
        
        return lsp_score

