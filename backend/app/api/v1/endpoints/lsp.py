"""
LSP (Liquidity Shock Prediction) Index Endpoints

Provides endpoints for retrieving LSP scores and predictions.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional
from datetime import datetime, timedelta
from app.database.database import get_db
from app.models.models import LSPScore
from app.services.lsp_service import LSPService

router = APIRouter()


@router.get("/current")
async def get_current_lsp(
    asset: str = Query("BTC", description="Asset symbol (BTC, ETH)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the current LSP score for an asset
    
    Args:
        asset: Asset symbol (default: BTC)
        db: Database session
        
    Returns:
        dict: Current LSP score and metadata
    """
    lsp_service = LSPService(db)
    score = await lsp_service.get_current_score(asset)
    
    if not score:
        return {
            "asset": asset,
            "score": None,
            "message": "No LSP score available for this asset"
        }
    
    return {
        "asset": asset,
        "score": float(score.score),
        "timestamp": score.timestamp.isoformat(),
        "interpretation": _interpret_score(float(score.score))
    }


@router.get("/history")
async def get_lsp_history(
    asset: str = Query("BTC", description="Asset symbol"),
    hours: int = Query(24, description="Number of hours of history"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get historical LSP scores for an asset
    
    Args:
        asset: Asset symbol
        hours: Number of hours of history to retrieve
        db: Database session
        
    Returns:
        dict: Historical LSP scores
    """
    cutoff_time = datetime.utcnow() - timedelta(hours=hours)
    
    stmt = select(LSPScore).where(
        LSPScore.asset_symbol == asset.upper(),
        LSPScore.timestamp >= cutoff_time
    ).order_by(desc(LSPScore.timestamp))
    
    result = await db.execute(stmt)
    scores = result.scalars().all()
    
    return {
        "asset": asset,
        "data": [
            {
                "score": float(score.score),
                "timestamp": score.timestamp.isoformat()
            }
            for score in scores
        ],
        "count": len(scores)
    }


def _interpret_score(score: float) -> str:
    """
    Interpret LSP score into human-readable description
    
    Args:
        score: LSP score (-10 to +10)
        
    Returns:
        str: Interpretation of the score
    """
    if score >= 7:
        return "High Liquidity Shock Risk - Significant downward pressure expected"
    elif score >= 3:
        return "Moderate Risk - Some downward pressure possible"
    elif score >= -3:
        return "Neutral - Balanced market conditions"
    elif score >= -7:
        return "Low Risk - Accumulation phase, upward pressure possible"
    else:
        return "Very Low Risk - Strong accumulation, bullish conditions"

