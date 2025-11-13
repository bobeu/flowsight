"""
WebSocket Endpoints

Provides WebSocket endpoints for real-time data streaming.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket_manager import WebSocketManager
from loguru import logger

router = APIRouter()


@router.websocket("/{room}")
async def websocket_endpoint(websocket: WebSocket, room: str):
    """
    WebSocket endpoint for real-time updates
    
    Args:
        websocket: WebSocket connection
        room: Room/channel to join (lsp_updates, whale_alerts, transactions)
    """
    # Get WebSocket manager from app state (set in main.py lifespan)
    from fastapi import Request
    # Access app state through websocket scope
    app = websocket.app
    manager = app.state.websocket_manager if hasattr(app.state, 'websocket_manager') else WebSocketManager()
    
    await manager.connect(websocket, room)
    
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            logger.debug(f"Received message from {websocket.client}: {data}")
            
            # Echo back or handle client messages
            await websocket.send_json({"type": "ack", "message": "received"})
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, room)
        logger.info(f"WebSocket disconnected: {websocket.client}")

