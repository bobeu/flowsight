"""
LSP Model Training Script

This script trains the LSTM model for LSP Index prediction.
For MVP, creates a simple model structure. In production, would:
- Load historical data
- Train on real features
- Validate and save model
"""

import numpy as np
from pathlib import Path
from loguru import logger

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    logger.warning("TensorFlow not available. Cannot train model.")


def create_lsp_model(input_shape: tuple = (6,)) -> keras.Model:
    """
    Create LSTM model for LSP prediction
    
    Args:
        input_shape: Shape of input features
        
    Returns:
        Compiled Keras model
    """
    if not TENSORFLOW_AVAILABLE:
        raise ImportError("TensorFlow is required for model training")
    
    model = keras.Sequential([
        layers.Dense(64, activation='relu', input_shape=input_shape),
        layers.Dropout(0.2),
        layers.Dense(32, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(16, activation='relu'),
        layers.Dense(1, activation='tanh')  # Output: -1 to 1, scaled to -10 to 10
    ])
    
    model.compile(
        optimizer='adam',
        loss='mse',
        metrics=['mae']
    )
    
    return model


def train_model(model: keras.Model, X_train: np.ndarray, y_train: np.ndarray) -> keras.Model:
    """
    Train the LSP model
    
    Args:
        model: Keras model to train
        X_train: Training features
        y_train: Training targets (LSP scores)
        
    Returns:
        Trained model
    """
    # Scale targets to -1 to 1 range (model outputs tanh)
    y_train_scaled = y_train / 10.0
    
    history = model.fit(
        X_train,
        y_train_scaled,
        epochs=50,
        batch_size=32,
        validation_split=0.2,
        verbose=1
    )
    
    return model


def generate_mock_training_data(n_samples: int = 1000) -> tuple:
    """
    Generate mock training data for MVP
    
    Args:
        n_samples: Number of samples to generate
        
    Returns:
        Tuple of (X, y) training data
    """
    np.random.seed(42)
    
    # Generate random features
    X = np.random.randn(n_samples, 6)
    
    # Generate targets based on simple heuristic
    # This is just for MVP - real training would use historical data
    y = (
        -X[:, 0] * 2.0 +  # Net flow (negative = bullish)
        (X[:, 1] - 1.0) * 3.0 +  # SOPR
        -X[:, 2] * 2.0 +  # Stablecoin ratio
        (1.0 - X[:, 3]) * 2.0  # Liquidity depth
    )
    
    # Add noise
    y += np.random.randn(n_samples) * 0.5
    
    # Clamp to -10 to 10
    y = np.clip(y, -10.0, 10.0)
    
    return X, y


if __name__ == "__main__":
    if not TENSORFLOW_AVAILABLE:
        logger.error("TensorFlow not available. Cannot train model.")
        exit(1)
    
    logger.info("Creating LSP model...")
    model = create_lsp_model()
    
    logger.info("Generating mock training data...")
    X_train, y_train = generate_mock_training_data(1000)
    
    logger.info("Training model...")
    trained_model = train_model(model, X_train, y_train)
    
    # Save model
    model_dir = Path("app/ml/models")
    model_dir.mkdir(parents=True, exist_ok=True)
    model_path = model_dir / "lsp_model.h5"
    
    trained_model.save(str(model_path))
    logger.info(f"✅ Model saved to {model_path}")

