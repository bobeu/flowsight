/**
 * API Client
 * 
 * Centralized API client for making requests to the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface LSPResponse {
  asset: string
  score: number | null
  timestamp: string
  interpretation: string
}

export interface Whale {
  address: string
  label: string | null
  total_holdings_usd: number
  is_exchange: boolean
  curator_address: string | null
}

export interface Transaction {
  tx_hash: string
  from_address: string
  to_address: string
  amount_usd: number
  token_symbol: string
  block_number: number
  timestamp: string
}

/**
 * Fetch current LSP score for an asset
 */
export async function getCurrentLSP(asset: string): Promise<LSPResponse> {
  const response = await fetch(`${API_URL}/api/v1/lsp/current?asset=${asset}`)
  if (!response.ok) {
    throw new Error('Failed to fetch LSP score')
  }
  return response.json()
}

/**
 * Fetch LSP history for an asset
 */
export async function getLSPHistory(asset: string, hours: number = 24) {
  const response = await fetch(`${API_URL}/api/v1/lsp/history?asset=${asset}&hours=${hours}`)
  if (!response.ok) {
    throw new Error('Failed to fetch LSP history')
  }
  return response.json()
}

/**
 * Fetch top whale wallets
 */
export async function getTopWhales(limit: number = 10): Promise<{ count: number; whales: Whale[] }> {
  const response = await fetch(`${API_URL}/api/v1/whales/top?limit=${limit}`)
  if (!response.ok) {
    throw new Error('Failed to fetch whales')
  }
  return response.json()
}

/**
 * Fetch whale details
 */
export async function getWhaleDetails(address: string) {
  const response = await fetch(`${API_URL}/api/v1/whales/${address}`)
  if (!response.ok) {
    throw new Error('Failed to fetch whale details')
  }
  return response.json()
}

/**
 * Fetch recent transactions
 */
export async function getRecentTransactions(limit: number = 50) {
  const response = await fetch(`${API_URL}/api/v1/transactions/recent?limit=${limit}`)
  if (!response.ok) {
    throw new Error('Failed to fetch transactions')
  }
  return response.json()
}

/**
 * Fetch whale alerts
 */
export async function getWhaleAlerts(hours: number = 24, minAmount: number = 1000000) {
  const response = await fetch(
    `${API_URL}/api/v1/transactions/alerts?hours=${hours}&min_amount=${minAmount}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch alerts')
  }
  return response.json()
}

