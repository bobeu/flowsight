"""
Backtesting Framework for LSP Index

This module implements quantitative backtesting methodology as specified in PROMPT.md.
Uses backtrader or custom solutions with Pandas/NumPy to evaluate LSP Index performance.

Key Metrics:
- Sortino Ratio (critical for crypto)
- Maximum Drawdown (MDD)
- Accuracy (Directional)
- Annualized Return
- Win Rate / Expectancy
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
from loguru import logger


class LSPBacktester:
    """
    Backtesting framework for LSP Index predictions
    
    Implements the methodology from PROMPT.md:
    - Entry Signal: LSP Score >= +7 (High Risk) → Short/Reduce Exposure
    - Exit Signal: LSP Score <= -7 (Low Risk) → Long/Increase Exposure
    - Incorporates trading fees (0.1%) and slippage
    """
    
    def __init__(
        self,
        trading_fee: float = 0.001,  # 0.1% trading fee
        slippage: float = 0.0005,  # 0.05% slippage
    ):
        """
        Initialize backtester
        
        Args:
            trading_fee: Trading fee percentage (default 0.1%)
            slippage: Slippage percentage (default 0.05%)
        """
        self.trading_fee = trading_fee
        self.slippage = slippage
        self.trades: List[Dict] = []
        self.equity_curve: List[float] = []
    
    def run_backtest(
        self,
        lsp_scores: pd.DataFrame,
        price_data: pd.DataFrame,
        initial_capital: float = 100000.0,
    ) -> Dict[str, float]:
        """
        Run backtest on historical LSP scores and price data
        
        Args:
            lsp_scores: DataFrame with columns ['timestamp', 'lsp_score', 'asset']
            price_data: DataFrame with columns ['timestamp', 'price', 'asset']
            initial_capital: Starting capital in USD
            
        Returns:
            Dictionary with performance metrics
        """
        # Merge dataframes on timestamp and asset
        merged = pd.merge(
            lsp_scores,
            price_data,
            on=['timestamp', 'asset'],
            how='inner'
        ).sort_values('timestamp')
        
        if merged.empty:
            logger.error("No matching data for backtest")
            return {}
        
        # Initialize tracking variables
        capital = initial_capital
        position = 0  # 0 = no position, 1 = long, -1 = short
        entry_price = 0.0
        entry_timestamp = None
        
        self.equity_curve = [initial_capital]
        self.trades = []
        
        # Simulate trading
        for idx, row in merged.iterrows():
            lsp_score = row['lsp_score']
            price = row['price']
            timestamp = row['timestamp']
            
            # Entry signal: LSP >= +7 (High Risk) → Short/Reduce Exposure
            if lsp_score >= 7.0 and position != -1:
                # Close long position if exists
                if position == 1:
                    pnl = self._close_position(
                        capital, position, entry_price, price, timestamp
                    )
                    capital += pnl
                
                # Open short position
                position = -1
                entry_price = price * (1 + self.slippage)  # Account for slippage
                entry_timestamp = timestamp
                capital *= (1 - self.trading_fee)  # Pay trading fee
            
            # Exit signal: LSP <= -7 (Low Risk) → Long/Increase Exposure
            elif lsp_score <= -7.0 and position != 1:
                # Close short position if exists
                if position == -1:
                    pnl = self._close_position(
                        capital, position, entry_price, price, timestamp
                    )
                    capital += pnl
                
                # Open long position
                position = 1
                entry_price = price * (1 - self.slippage)  # Account for slippage
                entry_timestamp = timestamp
                capital *= (1 - self.trading_fee)  # Pay trading fee
            
            # Update equity curve
            current_equity = capital
            if position != 0:
                # Calculate unrealized PnL
                if position == 1:  # Long
                    unrealized_pnl = capital * ((price - entry_price) / entry_price)
                else:  # Short
                    unrealized_pnl = capital * ((entry_price - price) / entry_price)
                current_equity += unrealized_pnl
            
            self.equity_curve.append(current_equity)
        
        # Close any open position at the end
        if position != 0:
            final_price = merged.iloc[-1]['price']
            final_timestamp = merged.iloc[-1]['timestamp']
            pnl = self._close_position(
                capital, position, entry_price, final_price, final_timestamp
            )
            capital += pnl
            self.equity_curve[-1] = capital
        
        # Calculate performance metrics
        metrics = self._calculate_metrics(initial_capital, capital, merged)
        
        return metrics
    
    def _close_position(
        self,
        capital: float,
        position: int,
        entry_price: float,
        exit_price: float,
        timestamp: datetime,
    ) -> float:
        """
        Close a position and calculate PnL
        
        Args:
            capital: Current capital
            position: Position type (1 = long, -1 = short)
            entry_price: Entry price
            exit_price: Exit price
            timestamp: Exit timestamp
            
        Returns:
            Profit/Loss amount
        """
        if position == 1:  # Long position
            pnl = capital * ((exit_price - entry_price) / entry_price)
        else:  # Short position
            pnl = capital * ((entry_price - exit_price) / entry_price)
        
        # Account for slippage and fees
        pnl -= capital * (self.slippage + self.trading_fee)
        
        # Record trade
        self.trades.append({
            'entry_price': entry_price,
            'exit_price': exit_price,
            'position': 'long' if position == 1 else 'short',
            'pnl': pnl,
            'timestamp': timestamp,
        })
        
        return pnl
    
    def _calculate_metrics(
        self,
        initial_capital: float,
        final_capital: float,
        data: pd.DataFrame,
    ) -> Dict[str, float]:
        """
        Calculate performance metrics as specified in PROMPT.md
        
        Args:
            initial_capital: Starting capital
            final_capital: Ending capital
            data: Historical data
            
        Returns:
            Dictionary with performance metrics
        """
        # Total return
        total_return = (final_capital - initial_capital) / initial_capital
        
        # Calculate time period
        start_date = data['timestamp'].min()
        end_date = data['timestamp'].max()
        years = (end_date - start_date).days / 365.25
        
        # Annualized return
        if years > 0:
            annualized_return = ((final_capital / initial_capital) ** (1 / years)) - 1
        else:
            annualized_return = 0.0
        
        # Maximum Drawdown (MDD)
        equity_series = pd.Series(self.equity_curve)
        running_max = equity_series.expanding().max()
        drawdown = (equity_series - running_max) / running_max
        max_drawdown = abs(drawdown.min())
        
        # Sortino Ratio (downside deviation only)
        returns = equity_series.pct_change().dropna()
        downside_returns = returns[returns < 0]
        downside_std = downside_returns.std() if len(downside_returns) > 0 else 0.0001
        
        if downside_std > 0:
            sortino_ratio = annualized_return / downside_std
        else:
            sortino_ratio = 0.0
        
        # Win rate and expectancy
        if self.trades:
            profitable_trades = [t for t in self.trades if t['pnl'] > 0]
            win_rate = len(profitable_trades) / len(self.trades)
            avg_profit = np.mean([t['pnl'] for t in self.trades])
        else:
            win_rate = 0.0
            avg_profit = 0.0
        
        # Directional accuracy (simplified - would need actual price movements)
        # This is a placeholder - in production, would compare LSP predictions
        # to actual price volatility direction
        directional_accuracy = 0.0  # Would be calculated from actual predictions
        
        return {
            'total_return': total_return,
            'annualized_return': annualized_return,
            'max_drawdown': max_drawdown,
            'sortino_ratio': sortino_ratio,
            'win_rate': win_rate,
            'avg_profit_per_trade': avg_profit,
            'total_trades': len(self.trades),
            'directional_accuracy': directional_accuracy,
        }

