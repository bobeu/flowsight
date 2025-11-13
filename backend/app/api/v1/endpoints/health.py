"""
Health Check Endpoints

Provides health check and system status endpoints for monitoring.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database.database import get_db
import redis.asyncio as redis
from app.core.config import settings

router = APIRouter()


@router.get("/")
async def health_check():
    """
    Basic health check endpoint
    
    Returns:
        dict: Health status
    """
    return {"status": "healthy", "service": "flowsight-api"}


@router.get("/detailed")
async def detailed_health_check(db: AsyncSession = Depends(get_db)):
    """
    Detailed health check including database and Redis connectivity
    
    Args:
        db: Database session dependency
        
    Returns:
        dict: Detailed health status of all components
    """
    health_status = {
        "status": "healthy",
        "components": {}
    }
    
    # Check database
    try:
        await db.execute(text("SELECT 1"))
        health_status["components"]["database"] = "healthy"
    except Exception as e:
        health_status["components"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    # Check Redis
    try:
        redis_client = await redis.from_url(settings.REDIS_URL)
        await redis_client.ping()
        await redis_client.close()
        health_status["components"]["redis"] = "healthy"
    except Exception as e:
        health_status["components"]["redis"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"
    
    return health_status

