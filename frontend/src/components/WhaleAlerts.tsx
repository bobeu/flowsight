/**
 * Whale Alerts Component
 * 
 * Real-time alert feed for large transactions
 * Uses WebSocket for live updates
 * Uses Radix UI components for accessibility
 */

'use client'

import { useEffect, useState, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import * as Tooltip from '@/components/ui/Tooltip'
import { getWhaleAlerts } from '@/lib/api'

interface Alert {
  tx_hash: string
  from_address: string
  to_address: string
  amount_usd: number
  token_symbol: string
  timestamp: string
  alert_type: string
}

export default function WhaleAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Fetch initial alerts
    const fetchAlerts = async () => {
      try {
        const data = await getWhaleAlerts(24, 1000000)
        
        if (data.alerts) {
          setAlerts(data.alerts.slice(0, 20)) // Show last 20 alerts
        }
      } catch (error) {
        console.error('Error fetching alerts:', error)
        // Mock data for development
        setAlerts([
          {
            tx_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            from_address: '0x1111111111111111111111111111111111111111',
            to_address: '0x2222222222222222222222222222222222222222',
            amount_usd: 5000000,
            token_symbol: 'BTC',
            timestamp: new Date().toISOString(),
            alert_type: 'whale_transaction',
          },
        ])
      }
    }

    fetchAlerts()

    // Connect to WebSocket for real-time updates
    const connectWebSocket = () => {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
        const ws = new WebSocket(`${wsUrl}/api/v1/ws/whale_alerts`)
        
        ws.onopen = () => {
          setConnected(true)
          console.log('WebSocket connected')
        }
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            if (data.type === 'whale_alert' && data.data) {
              setAlerts((prev) => [data.data, ...prev.slice(0, 19)]) // Add new alert, keep last 20
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          setConnected(false)
        }
        
        ws.onclose = () => {
          setConnected(false)
          console.log('WebSocket disconnected')
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000)
        }
        
        wsRef.current = ws
      } catch (error) {
        console.error('Error connecting WebSocket:', error)
        setConnected(false)
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatUSD = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Tooltip.TooltipProvider>
      <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6">
        {/* Connection Status */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-mono text-electric-cyan">Live Alerts</h3>
          <Tooltip.Tooltip>
            <Tooltip.TooltipTrigger asChild>
              <div className="flex items-center space-x-2 cursor-help">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connected ? 'bg-lime-green animate-pulse-cyan' : 'bg-sentinel-red'
                  }`}
                />
                <span className="text-xs text-light-gray">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </Tooltip.TooltipTrigger>
            <Tooltip.TooltipContent>
              <p>WebSocket connection status for real-time updates</p>
            </Tooltip.TooltipContent>
          </Tooltip.Tooltip>
        </div>

        {/* Alerts List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.map((alert) => (
            <Tooltip.Tooltip key={alert.tx_hash}>
              <Tooltip.TooltipTrigger asChild>
                <div className="bg-midnight-blue/30 border border-electric-cyan/20 rounded p-3 hover:border-electric-cyan/40 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-electric-cyan font-mono text-sm mb-1">
                        {formatUSD(alert.amount_usd)} {alert.token_symbol}
                      </p>
                      <p className="text-light-gray text-xs">
                        {formatAddress(alert.from_address)} → {formatAddress(alert.to_address)}
                      </p>
                    </div>
                    <span className="text-xs text-light-gray/70">
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-light-gray/70 font-mono break-all">
                    {formatAddress(alert.tx_hash)}
                  </p>
                </div>
              </Tooltip.TooltipTrigger>
              <Tooltip.TooltipContent className="max-w-md">
                <div className="space-y-1">
                  <p className="font-mono text-xs break-all">Full TX: {alert.tx_hash}</p>
                  <p className="text-xs">From: {alert.from_address}</p>
                  <p className="text-xs">To: {alert.to_address}</p>
                  <p className="text-xs">Amount: {formatUSD(alert.amount_usd)} {alert.token_symbol}</p>
                </div>
              </Tooltip.TooltipContent>
            </Tooltip.Tooltip>
          ))}
        </div>

        {alerts.length === 0 && (
          <div className="text-center text-light-gray py-8">
            No alerts yet. Waiting for large transactions...
          </div>
        )}
      </div>
    </Tooltip.TooltipProvider>
  )
}

