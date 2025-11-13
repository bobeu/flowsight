"""
API Router - Version 1

This module aggregates all API routes for version 1 of the FlowSight API.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import lsp, whales, transactions, health, websocket, subscriptions, curators

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(lsp.router, prefix="/lsp", tags=["lsp"])
api_router.include_router(whales.router, prefix="/whales", tags=["whales"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(websocket.router, prefix="/ws", tags=["websocket"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
api_router.include_router(curators.router, prefix="/curators", tags=["curators"])

