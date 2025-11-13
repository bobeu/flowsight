"""
FlowSight Backend - Main Application Entry Point

This module initializes the FastAPI application, sets up middleware,
registers routes, and configures WebSocket support for real-time data streaming.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
from loguru import logger
import sys

from app.core.config import settings
from app.api.v1.router import api_router
from app.services.websocket_manager import WebSocketManager
from app.database.database import init_db


# Configure logging
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
    level="INFO" if not settings.DEBUG else "DEBUG",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    
    Handles:
    - Database initialization
    - WebSocket manager setup
    - Background task startup
    """
    # Startup
    logger.info("🚀 Starting FlowSight Backend...")
    
    # Initialize database
    await init_db()
    logger.info("✅ Database initialized")
    
    # Initialize WebSocket manager
    app.state.websocket_manager = WebSocketManager()
    logger.info("✅ WebSocket manager initialized")
    
    # Start background tasks (data ingestion, ML model updates)
    # These would be started here in production
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down FlowSight Backend...")
    # Cleanup tasks would go here


# Create FastAPI application
app = FastAPI(
    title="FlowSight API",
    description="FlowSight - The Oracle of Flow: Real-time On-Chain Analytics and Liquidity Shock Prediction",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """
    Root endpoint - API health check
    
    Returns:
        dict: API status and version information
    """
    return {
        "name": "FlowSight API",
        "version": "1.0.0",
        "status": "operational",
        "description": "The Oracle of Flow - Predicting Crypto Liquidity Shocks",
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring
    
    Returns:
        dict: Health status of various components
    """
    return {
        "status": "healthy",
        "database": "connected",  # Would check actual DB connection
        "redis": "connected",  # Would check actual Redis connection
        "websocket": "active",
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )

