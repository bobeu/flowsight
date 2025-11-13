"""
Subscription Management Endpoints

Provides endpoints for managing user subscriptions (Tier 2: Retail)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.database.database import get_db

router = APIRouter()


class SubscriptionTier(BaseModel):
    """Subscription tier model"""
    name: str
    price: float
    price_in_flow: int
    features: list[str]


class SubscriptionRequest(BaseModel):
    """Subscription request model"""
    tier: str
    payment_method: str  # 'fiat' or 'flow'
    wallet_address: Optional[str] = None  # Required if payment_method is 'flow'


class SubscriptionResponse(BaseModel):
    """Subscription response model"""
    user_id: str
    tier: str
    status: str
    start_date: datetime
    end_date: datetime
    payment_method: str


# Mock subscription tiers (in production, store in database)
SUBSCRIPTION_TIERS = {
    "free": SubscriptionTier(
        name="Free",
        price=0.0,
        price_in_flow=0,
        features=[
            "View Global LSP Index",
            "Basic whale tracker (top 10)",
            "Standard alert feed",
            "Community support",
        ]
    ),
    "pro": SubscriptionTier(
        name="Pro",
        price=49.0,
        price_in_flow=5000,
        features=[
            "Full dashboard access",
            "All alert customizations",
            "5 Whale Wallet tracking slots",
            "Advanced LSP Index analytics",
            "Priority support",
            "Historical data access (30 days)",
        ]
    ),
    "premium": SubscriptionTier(
        name="Premium",
        price=149.0,
        price_in_flow=15000,
        features=[
            "Everything in Pro",
            "Predictive model parameters",
            "Exclusive research reports",
            "Unlimited Whale Wallet tracking",
            "Historical data access (1 year)",
            "API access (limited)",
            "Direct support from team",
            "Early access to new features",
        ]
    ),
}


@router.get("/tiers")
async def get_subscription_tiers():
    """
    Get all available subscription tiers
    
    Returns:
        dict: List of subscription tiers with pricing and features
    """
    return {
        "tiers": [
            {
                "name": tier.name,
                "price": tier.price,
                "price_in_flow": tier.price_in_flow,
                "features": tier.features,
            }
            for tier in SUBSCRIPTION_TIERS.values()
        ]
    }


@router.get("/tiers/{tier_name}")
async def get_subscription_tier(tier_name: str):
    """
    Get specific subscription tier details
    
    Args:
        tier_name: Name of the tier (free, pro, premium)
        
    Returns:
        dict: Subscription tier details
    """
    if tier_name.lower() not in SUBSCRIPTION_TIERS:
        raise HTTPException(status_code=404, detail="Tier not found")
    
    tier = SUBSCRIPTION_TIERS[tier_name.lower()]
    return {
        "name": tier.name,
        "price": tier.price,
        "price_in_flow": tier.price_in_flow,
        "features": tier.features,
    }


@router.post("/subscribe")
async def create_subscription(
    request: SubscriptionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new subscription
    
    Args:
        request: Subscription request with tier and payment method
        db: Database session
        
    Returns:
        dict: Subscription confirmation
    """
    tier_name = request.tier.lower()
    
    if tier_name not in SUBSCRIPTION_TIERS:
        raise HTTPException(status_code=400, detail="Invalid tier")
    
    tier = SUBSCRIPTION_TIERS[tier_name]
    
    # TODO: Implement actual subscription logic
    # - Verify payment (fiat or FLOW token)
    # - Create subscription record in database
    # - Set expiration date (1 month from now)
    # - Return subscription details
    
    # Mock response
    return {
        "message": "Subscription created successfully",
        "subscription": {
            "tier": tier.name,
            "price": tier.price if request.payment_method == "fiat" else tier.price_in_flow,
            "payment_method": request.payment_method,
            "start_date": datetime.utcnow().isoformat(),
            "end_date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "status": "active",
        }
    }


@router.get("/user/{user_id}")
async def get_user_subscription(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's current subscription
    
    Args:
        user_id: User identifier
        db: Database session
        
    Returns:
        dict: User subscription details
    """
    # TODO: Query database for user subscription
    # Mock response
    return {
        "user_id": user_id,
        "tier": "free",
        "status": "active",
        "start_date": datetime.utcnow().isoformat(),
        "end_date": None,
    }


@router.post("/cancel/{user_id}")
async def cancel_subscription(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Cancel user's subscription
    
    Args:
        user_id: User identifier
        db: Database session
        
    Returns:
        dict: Cancellation confirmation
    """
    # TODO: Implement cancellation logic
    return {
        "message": "Subscription cancelled successfully",
        "user_id": user_id,
    }

