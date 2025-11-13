"""
WebSocket Manager

Manages WebSocket connections for real-time data streaming to the frontend.
Handles connections, broadcasting, and connection lifecycle.
"""

from typing import Set, Dict, Any
from fastapi import WebSocket, WebSocketDisconnect
from loguru import logger
import json
import asyncio


class WebSocketManager:
    """
    Manages WebSocket connections for real-time updates
    
    Features:
    - Connection management
    - Room-based broadcasting
    - Automatic reconnection handling
    """
    
    def __init__(self):
        """Initialize WebSocket manager"""
        self.active_connections: Set[WebSocket] = set()
        self.rooms: Dict[str, Set[WebSocket]] = {
            "lsp_updates": set(),
            "whale_alerts": set(),
            "transactions": set(),
        }
    
    async def connect(self, websocket: WebSocket, room: str = "general") -> None:
        """
        Accept and register a new WebSocket connection
        
        Args:
            websocket: WebSocket connection
            room: Room/channel to join
        """
        await websocket.accept()
        self.active_connections.add(websocket)
        
        if room in self.rooms:
            self.rooms[room].add(websocket)
        
        logger.info(f"WebSocket connected: {websocket.client}, room: {room}")
    
    def disconnect(self, websocket: WebSocket, room: str = "general") -> None:
        """
        Remove a WebSocket connection
        
        Args:
            websocket: WebSocket connection to remove
            room: Room/channel to leave
        """
        self.active_connections.discard(websocket)
        
        if room in self.rooms:
            self.rooms[room].discard(websocket)
        
        logger.info(f"WebSocket disconnected: {websocket.client}")
    
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket) -> None:
        """
        Send a message to a specific WebSocket connection
        
        Args:
            message: Message data to send
            websocket: Target WebSocket connection
        """
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            self.disconnect(websocket)
    
    async def broadcast_to_room(self, message: Dict[str, Any], room: str) -> None:
        """
        Broadcast a message to all connections in a room
        
        Args:
            message: Message data to broadcast
            room: Room/channel to broadcast to
        """
        if room not in self.rooms:
            logger.warning(f"Room {room} does not exist")
            return
        
        disconnected = set()
        for connection in self.rooms[room]:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {e}")
                disconnected.add(connection)
        
        # Remove disconnected connections
        for conn in disconnected:
            self.disconnect(conn, room)
    
    async def broadcast_lsp_update(self, asset: str, score: float, timestamp: str) -> None:
        """
        Broadcast LSP score update
        
        Args:
            asset: Asset symbol
            score: LSP score
            timestamp: Timestamp of the update
        """
        message = {
            "type": "lsp_update",
            "data": {
                "asset": asset,
                "score": score,
                "timestamp": timestamp
            }
        }
        await self.broadcast_to_room(message, "lsp_updates")
    
    async def broadcast_whale_alert(self, transaction: Dict[str, Any]) -> None:
        """
        Broadcast whale transaction alert
        
        Args:
            transaction: Transaction data
        """
        message = {
            "type": "whale_alert",
            "data": transaction
        }
        await self.broadcast_to_room(message, "whale_alerts")

