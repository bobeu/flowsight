"""
Machine Learning Service

This service handles ML model loading, inference, and prediction.
For MVP, uses a simple LSTM model for LSP Index prediction.
"""

import numpy as np
from typing import Dict, Any
from loguru import logger
import os
from pathlib import Path

# For MVP, we'll use a mock model. In production, this would load TensorFlow/PyTorch models
try:
    import tensorflow as tf
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    logger.warning("TensorFlow not available, using mock predictions")


class MLService:
    """
    Service for ML model inference and predictions
    """
    
    def __init__(self):
        """Initialize ML service"""
        self.model = None
        self.model_loaded = False
        self._load_model()
    
    def _load_model(self) -> None:
        """
        Load the LSP prediction model
        
        For MVP, uses a simple mock. In production, loads actual TensorFlow model.
        """
        if not TENSORFLOW_AVAILABLE:
            logger.info("Using mock ML model for MVP")
            self.model_loaded = True
            return
        
        model_path = Path("app/ml/models/lsp_model.h5")
        
        if model_path.exists():
            try:
                self.model = tf.keras.models.load_model(str(model_path))
                self.model_loaded = True
                logger.info("LSP model loaded successfully")
            except Exception as e:
                logger.error(f"Error loading model: {e}")
                self.model_loaded = False
        else:
            logger.warning(f"Model file not found at {model_path}, using mock predictions")
            self.model_loaded = False
    
    async def predict_lsp(self, features: Dict[str, Any]) -> float:
        """
        Predict LSP score from advanced on-chain features
        
        Args:
            features: Dictionary of input features (as per PROMPT.md):
                - whale_net_flow_momentum: Exchange Netflow (CEX/DEX) - rate of change
                - sopr: Spent Output Profit Ratio (Glassnode/Nansen) - profit/loss signal
                - stablecoin_ratio: Stablecoin ratio - buying power indicator
                - illiquid_supply_change: Illiquid supply change - accumulation signal
                - dex_liquidity_depth: DEX liquidity depth (5% impact) - shock vulnerability
                - price_volatility: Price volatility (4-hour Keltner Channel width)
                
        Returns:
            float: LSP score (-10 to +10)
        """
        if not self.model_loaded or self.model is None:
            # Mock prediction for MVP
            return self._mock_predict(features)
        
        try:
            # Prepare input features as numpy array
            feature_array = np.array([
                features.get("whale_net_flow_momentum", 0.0),
                features.get("sopr", 1.0),
                features.get("stablecoin_ratio", 0.5),
                features.get("illiquid_supply_change", 0.0),
                features.get("dex_liquidity_depth", 1000000.0),
                features.get("price_volatility", 0.02),
            ]).reshape(1, -1)
            
            # Get prediction
            prediction = self.model.predict(feature_array, verbose=0)[0][0]
            
            # Clamp to -10 to +10 range
            prediction = np.clip(prediction, -10.0, 10.0)
            
            return float(prediction)
            
        except Exception as e:
            logger.error(f"Error in prediction: {e}")
            return self._mock_predict(features)
    
    def _mock_predict(self, features: Dict[str, Any]) -> float:
        """
        Advanced heuristic-based prediction for MVP
        
        Implements the LSP Index features as specified in PROMPT.md:
        - Whale Net Flow Momentum: Rate of change in net tokens to exchanges
        - SOPR: Spent Output Profit Ratio (capitulation signal when close to 1)
        - Stablecoin Ratio: Buying power indicator (high = bullish)
        - Illiquid Supply Change: Accumulation signal (rising = bullish)
        - DEX Liquidity Depth: Shock vulnerability (low = bearish)
        - Price Volatility: 4-hour Keltner Channel width
        
        Args:
            features: Input features dictionary
            
        Returns:
            float: LSP score (-10 to +10)
        """
        # Extract features with defaults
        whale_net_flow_momentum = features.get("whale_net_flow_momentum", 0.0)
        sopr = features.get("sopr", 1.0)
        stablecoin_ratio = features.get("stablecoin_ratio", 0.5)
        illiquid_supply_change = features.get("illiquid_supply_change", 0.0)
        dex_liquidity_depth = features.get("dex_liquidity_depth", 1000000.0)
        price_volatility = features.get("price_volatility", 0.02)
        
        # Initialize score
        score = 0.0
        
        # 1. Whale Net Flow Momentum (negative = outflow = bullish)
        # Rising outflow momentum → bullish accumulation → negative LSP
        score -= whale_net_flow_momentum * 2.5
        
        # 2. SOPR (Spent Output Profit Ratio)
        # Value close to 1 after sell-off = capitulation = potential turning point
        # High SOPR (>1.1) = profit-taking = bearish
        # Low SOPR (<0.9) = loss-taking = potential bottom
        if sopr > 1.1:
            score += (sopr - 1.0) * 3.0  # High profit-taking = bearish
        elif sopr < 0.9:
            score -= (1.0 - sopr) * 2.0  # Loss-taking = potential bottom = bullish
        else:
            # Close to 1 = neutral/capitulation signal
            score += (sopr - 1.0) * 1.5
        
        # 3. Stablecoin Ratio (high = dry powder ready = bullish)
        # High SR → high buying power → low LSP risk
        score -= (stablecoin_ratio - 0.5) * 2.5
        
        # 4. Illiquid Supply Change (rising = accumulation = bullish)
        # Rising illiquid supply → long-term accumulation → low LSP
        score -= illiquid_supply_change * 1.5
        
        # 5. DEX Liquidity Depth (low = vulnerable to shock = bearish)
        # Low depth → high LSP (vulnerable to shock)
        normalized_depth = min(dex_liquidity_depth / 10_000_000, 1.0)
        score += (1.0 - normalized_depth) * 2.5
        
        # 6. Price Volatility (high volatility = high risk = positive LSP)
        # High volatility → high risk → positive LSP
        score += price_volatility * 50.0  # Scale volatility appropriately
        
        # Clamp to -10 to +10 range
        score = max(-10.0, min(10.0, score))
        
        return float(score)

