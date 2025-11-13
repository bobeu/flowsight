"""
Whale Tracker Endpoints

Provides endpoints for retrieving whale wallet information and tracking.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from typing import Optional
from app.database.database import get_db
from app.models.models import WhaleWallet, Transaction

router = APIRouter()


@router.get("/top")
async def get_top_whales(
    limit: int = Query(10, ge=1, le=100, description="Number of whales to return"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get top whale wallets by holdings
    
    Args:
        limit: Maximum number of whales to return
        db: Database session
        
    Returns:
        dict: List of top whale wallets
    """
    stmt = select(WhaleWallet).order_by(
        desc(WhaleWallet.total_holdings_usd)
    ).limit(limit)
    
    result = await db.execute(stmt)
    whales = result.scalars().all()
    
    return {
        "count": len(whales),
        "whales": [
            {
                "address": whale.address,
                "label": whale.label,
                "total_holdings_usd": float(whale.total_holdings_usd),
                "is_exchange": whale.is_exchange,
                "curator_address": whale.curator_address
            }
            for whale in whales
        ]
    }


@router.get("/{address}")
async def get_whale_details(
    address: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed information about a specific whale wallet
    
    Args:
        address: Wallet address
        db: Database session
        
    Returns:
        dict: Whale wallet details and recent transactions
    """
    stmt = select(WhaleWallet).where(WhaleWallet.address == address)
    result = await db.execute(stmt)
    whale = result.scalar_one_or_none()
    
    if not whale:
        return {"error": "Whale wallet not found"}
    
    # Get recent transactions
    tx_stmt = select(Transaction).where(
        Transaction.whale_wallet_address == address
    ).order_by(desc(Transaction.timestamp)).limit(10)
    
    tx_result = await db.execute(tx_stmt)
    transactions = tx_result.scalars().all()
    
    return {
        "address": whale.address,
        "label": whale.label,
        "total_holdings_usd": float(whale.total_holdings_usd),
        "is_exchange": whale.is_exchange,
        "curator_address": whale.curator_address,
        "recent_transactions": [
            {
                "tx_hash": tx.tx_hash,
                "from_address": tx.from_address,
                "to_address": tx.to_address,
                "amount_usd": float(tx.amount_usd),
                "token_symbol": tx.token_symbol,
                "timestamp": tx.timestamp.isoformat()
            }
            for tx in transactions
        ]
    }

