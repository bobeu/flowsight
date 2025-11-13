"""
Transaction Endpoints

Provides endpoints for retrieving large transactions and whale alerts.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional
from datetime import datetime, timedelta
from app.database.database import get_db
from app.models.models import Transaction

router = APIRouter()


@router.get("/recent")
async def get_recent_transactions(
    limit: int = Query(50, ge=1, le=500, description="Number of transactions to return"),
    min_amount: Optional[float] = Query(None, description="Minimum transaction amount in USD"),
    asset: Optional[str] = Query(None, description="Filter by asset symbol"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get recent large transactions
    
    Args:
        limit: Maximum number of transactions to return
        min_amount: Minimum transaction amount in USD
        asset: Filter by asset symbol
        db: Database session
        
    Returns:
        dict: List of recent transactions
    """
    stmt = select(Transaction).order_by(desc(Transaction.timestamp))
    
    if min_amount:
        stmt = stmt.where(Transaction.amount_usd >= min_amount)
    
    if asset:
        stmt = stmt.where(Transaction.token_symbol == asset.upper())
    
    stmt = stmt.limit(limit)
    
    result = await db.execute(stmt)
    transactions = result.scalars().all()
    
    return {
        "count": len(transactions),
        "transactions": [
            {
                "tx_hash": tx.tx_hash,
                "from_address": tx.from_address,
                "to_address": tx.to_address,
                "amount_usd": float(tx.amount_usd),
                "token_symbol": tx.token_symbol,
                "block_number": tx.block_number,
                "timestamp": tx.timestamp.isoformat()
            }
            for tx in transactions
        ]
    }


@router.get("/alerts")
async def get_whale_alerts(
    hours: int = Query(24, description="Number of hours to look back"),
    min_amount: float = Query(1_000_000, description="Minimum amount in USD"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get whale alert feed - large transactions within specified time window
    
    Args:
        hours: Number of hours to look back
        min_amount: Minimum transaction amount in USD
        db: Database session
        
    Returns:
        dict: List of whale alerts
    """
    cutoff_time = datetime.utcnow() - timedelta(hours=hours)
    
    stmt = select(Transaction).where(
        Transaction.timestamp >= cutoff_time,
        Transaction.amount_usd >= min_amount
    ).order_by(desc(Transaction.timestamp))
    
    result = await db.execute(stmt)
    transactions = result.scalars().all()
    
    return {
        "count": len(transactions),
        "alerts": [
            {
                "tx_hash": tx.tx_hash,
                "from_address": tx.from_address,
                "to_address": tx.to_address,
                "amount_usd": float(tx.amount_usd),
                "token_symbol": tx.token_symbol,
                "timestamp": tx.timestamp.isoformat(),
                "alert_type": "whale_transaction"
            }
            for tx in transactions
        ]
    }

