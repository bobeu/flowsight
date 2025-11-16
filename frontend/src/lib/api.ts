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

/**
 * Wallet Tagging Interfaces
 */
export interface WalletTagRequest {
  wallet_address: string
  label: string
  category: 'exchange' | 'vc' | 'institution' | 'whale' | 'nft_collector' | 'other'
  curator_address: string
}

export interface WalletTagResponse {
  id: number
  wallet_address: string
  label: string
  category: string
  curator_address: string
  verified: boolean
  dispute_count: number
  created_at: string
}

export interface CuratorStats {
  curator_address: string
  staked_amount: string
  total_tags: number
  verified_tags: number
  disputed_tags: number
  accuracy: number
  total_rewards: string
}

/**
 * Create a wallet tag (only for Curators)
 */
export async function createWalletTag(request: WalletTagRequest): Promise<{ message: string; tag: WalletTagResponse }> {
  const response = await fetch(`${API_URL}/api/v1/curators/tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create wallet tag' }))
    throw new Error(errorData.message || 'Failed to create wallet tag')
  }
  
  return response.json()
}

/**
 * Get curator statistics
 */
export async function getCuratorStats(curatorAddress: string): Promise<CuratorStats> {
  const response = await fetch(`${API_URL}/api/v1/curators/${curatorAddress}`)
  if (!response.ok) {
    throw new Error('Failed to fetch curator stats')
  }
  return response.json()
}

/**
 * Get wallet tags with optional filters
 */
export async function getWalletTags(params?: {
  wallet_address?: string
  curator_address?: string
  verified?: boolean
  limit?: number
}): Promise<{ count: number; tags: WalletTagResponse[] }> {
  const queryParams = new URLSearchParams()
  if (params?.wallet_address) queryParams.append('wallet_address', params.wallet_address)
  if (params?.curator_address) queryParams.append('curator_address', params.curator_address)
  if (params?.verified !== undefined) queryParams.append('verified', params.verified.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  
  const response = await fetch(`${API_URL}/api/v1/curators/tags?${queryParams.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch wallet tags')
  }
  return response.json()
}

