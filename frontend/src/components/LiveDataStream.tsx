/**
 * Live Data Stream Component
 * 
 * Animated scrolling list showing real-time transaction data
 * Demonstrates FlowSight's real-time monitoring capabilities
 */

'use client'

import { useEffect, useState } from 'react'

interface StreamItem {
  id: string
  type: 'inflow' | 'outflow'
  amount: number
  asset: string
  timestamp: Date
}

export default function LiveDataStream() {
  const [items, setItems] = useState<StreamItem[]>([])

  useEffect(() => {
    // Generate initial items
    const generateItem = (): StreamItem => ({
      id: Math.random().toString(36).substr(2, 9),
      type: Math.random() > 0.5 ? 'inflow' : 'outflow',
      amount: Math.random() * 10 + 1,
      asset: Math.random() > 0.5 ? 'BTC' : 'ETH',
      timestamp: new Date(),
    })

    const initialItems = Array.from({ length: 5 }, generateItem)
    setItems(initialItems)

    // Add new item every 3-5 seconds
    const interval = setInterval(() => {
      setItems((prev) => {
        const newItem = generateItem()
        return [newItem, ...prev.slice(0, 4)] // Keep last 5 items
      })
    }, Math.random() * 2000 + 3000)

    return () => clearInterval(interval)
  }, [])

  const formatAmount = (amount: number) => {
    return `$${(amount * 1000000).toLocaleString()}`
  }

  return (
    <div className="bg-midnight-blue/30 border border-electric-cyan/20 rounded-lg p-4 h-48 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-mono text-electric-cyan">Live Data Stream</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-lime-green rounded-full animate-pulse-cyan"></div>
          <span className="text-xs text-light-gray/70">Live</span>
        </div>
      </div>
      <div className="space-y-2 h-32 overflow-y-auto scrollbar-hide">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 bg-midnight-blue/50 rounded border border-electric-cyan/10 animate-fade-in"
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  item.type === 'inflow' ? 'bg-lime-green' : 'bg-sentinel-red'
                }`}
              />
              <span className="text-xs text-light-gray font-mono">
                {item.asset}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-semibold ${
                  item.type === 'inflow' ? 'text-lime-green' : 'text-sentinel-red'
                }`}
              >
                {item.type === 'inflow' ? '+' : '-'}
                {formatAmount(item.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

