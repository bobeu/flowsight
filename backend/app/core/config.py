"""
FlowSight Configuration Management

This module handles all configuration settings using Pydantic Settings.
Loads environment variables and provides type-safe configuration access.
"""

from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    
    Attributes:
        DATABASE_URL: PostgreSQL connection string
        REDIS_URL: Redis connection string
        ENVIRONMENT: Current environment (development/production)
        DEBUG: Debug mode flag
        ALLOWED_ORIGINS: CORS allowed origins
        SECRET_KEY: JWT secret key
        ALGORITHM: JWT algorithm
        ACCESS_TOKEN_EXPIRE_MINUTES: JWT token expiration time
        API Keys: Various API keys for data sources (mock for MVP)
    """
    
    # Database
    DATABASE_URL: str = "postgresql://flowsight:flowsight_password@localhost:5432/flowsight_db"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API Keys (Mock for MVP - replace with real keys)
    GLASSNODE_API_KEY: str = ""
    CRYPTOQUANT_API_KEY: str = ""
    ETHERSCAN_API_KEY: str = ""
    BINANCE_API_KEY: str = ""
    BINANCE_SECRET_KEY: str = ""
    
    # WebSocket
    WS_PORT: int = 8000
    
    # ML Model
    ML_MODEL_PATH: str = "app/ml/models/lsp_model.h5"
    MODEL_UPDATE_INTERVAL: int = 3600  # Update model every hour
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()

