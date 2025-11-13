"""
Database Configuration and Session Management

This module handles database connection, session management, and initialization
for the PostgreSQL database with TimescaleDB extensions.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from loguru import logger

from app.core.config import settings

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncSession:
    """
    Dependency function to get database session
    
    Yields:
        AsyncSession: Database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database - create tables and enable TimescaleDB extension
    
    This function should be called on application startup
    """
    try:
        async with engine.begin() as conn:
            # Enable TimescaleDB extension if not already enabled
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"))
            logger.info("✅ TimescaleDB extension enabled")
            
            # Create all tables
            from app.models import models  # Import all models
            await conn.run_sync(Base.metadata.create_all)
            logger.info("✅ Database tables created")
            
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise

