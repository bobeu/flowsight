"""
Database Models

This module defines all SQLAlchemy models for the FlowSight database.
Includes models for transactions, whale wallets, LSP scores, and curator data.
"""

from sqlalchemy import Column, String, BigInteger, Numeric, DateTime, Boolean, Integer, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base


class WhaleWallet(Base):
    """
    Model for tracking identified whale wallets
    
    Attributes:
        address: Wallet address (primary key)
        label: Human-readable label (e.g., "Binance Cold Wallet")
        total_holdings_usd: Current total holdings in USD
        is_exchange: Whether this is an exchange wallet
        curator_address: Address of curator who tagged this wallet
        created_at: Timestamp when wallet was added
        updated_at: Timestamp of last update
    """
    __tablename__ = "whale_wallets"
    
    address = Column(String(42), primary_key=True, index=True)
    label = Column(String(255), nullable=True)
    total_holdings_usd = Column(Numeric(20, 2), default=0)
    is_exchange = Column(Boolean, default=False)
    curator_address = Column(String(42), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    transactions = relationship("Transaction", back_populates="whale_wallet")


class Transaction(Base):
    """
    Model for storing large transactions (>$1M USD)
    
    Attributes:
        id: Primary key
        tx_hash: Transaction hash
        from_address: Sender address
        to_address: Recipient address
        amount_usd: Transaction amount in USD
        token_symbol: Token symbol (BTC, ETH, etc.)
        block_number: Block number
        timestamp: Transaction timestamp
        whale_wallet_address: Foreign key to whale_wallets
    """
    __tablename__ = "transactions"
    
    id = Column(BigInteger, primary_key=True, index=True)
    tx_hash = Column(String(66), unique=True, index=True)
    from_address = Column(String(42), index=True)
    to_address = Column(String(42), index=True)
    amount_usd = Column(Numeric(20, 2))
    token_symbol = Column(String(10))
    block_number = Column(BigInteger)
    timestamp = Column(DateTime(timezone=True), index=True)
    whale_wallet_address = Column(String(42), ForeignKey("whale_wallets.address"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    whale_wallet = relationship("WhaleWallet", back_populates="transactions")


class LSPScore(Base):
    """
    Model for storing LSP (Liquidity Shock Prediction) Index scores
    
    Attributes:
        id: Primary key
        asset_symbol: Asset symbol (BTC, ETH, etc.)
        score: LSP score (-10 to +10)
        timestamp: When the score was calculated
        features: JSON string of input features used
    """
    __tablename__ = "lsp_scores"
    
    id = Column(BigInteger, primary_key=True, index=True)
    asset_symbol = Column(String(10), index=True)
    score = Column(Numeric(5, 2))  # -10.00 to +10.00
    timestamp = Column(DateTime(timezone=True), index=True)
    features = Column(Text)  # JSON string of features
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ExchangeFlow(Base):
    """
    Model for tracking exchange net flow data
    
    Attributes:
        id: Primary key
        exchange_name: Name of exchange (Binance, Coinbase, etc.)
        asset_symbol: Asset symbol
        net_flow: Net flow (positive = inflow, negative = outflow)
        timestamp: When the flow was recorded
    """
    __tablename__ = "exchange_flows"
    
    id = Column(BigInteger, primary_key=True, index=True)
    exchange_name = Column(String(50), index=True)
    asset_symbol = Column(String(10), index=True)
    net_flow = Column(Numeric(20, 2))  # Can be negative
    timestamp = Column(DateTime(timezone=True), index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Curator(Base):
    """
    Model for tracking on-chain curators
    
    Attributes:
        address: Curator wallet address (primary key)
        staked_amount: Amount of FLOW staked
        staked_at: When staking started
        is_active: Whether curator is currently active
        total_slash_count: Number of times slashed
        total_rewards: Total rewards earned
        contract_address: Address of staking contract
    """
    __tablename__ = "curators"
    
    address = Column(String(42), primary_key=True, index=True)
    staked_amount = Column(Numeric(20, 2))
    staked_at = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    total_slash_count = Column(Integer, default=0)
    total_rewards = Column(Numeric(20, 2), default=0)
    contract_address = Column(String(42))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PriceData(Base):
    """
    Model for storing historical price data
    
    Attributes:
        id: Primary key
        asset_symbol: Asset symbol
        price_usd: Price in USD
        volume_24h: 24-hour volume
        market_cap: Market capitalization
        timestamp: Price timestamp
    """
    __tablename__ = "price_data"
    
    id = Column(BigInteger, primary_key=True, index=True)
    asset_symbol = Column(String(10), index=True)
    price_usd = Column(Numeric(20, 2))
    volume_24h = Column(Numeric(20, 2))
    market_cap = Column(Numeric(20, 2))
    timestamp = Column(DateTime(timezone=True), index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

