/**
 * Price Chart Component
 * 
 * Displays price chart for a given asset using Recharts
 * Enhanced with gradients, animations, and professional styling
 */

'use client'

import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface PriceData {
  timestamp: string
  price: number
}

interface PriceChartProps {
  asset: string
}

export default function PriceChart({ asset }: PriceChartProps) {
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [priceChange, setPriceChange] = useState<number>(0)

  useEffect(() => {
    // Mock price data for MVP
    // In production, this would fetch from the API
    const generateMockData = () => {
      const data: PriceData[] = []
      // Base prices for different assets
      const basePrice = asset === 'BTC' ? 45000 : asset === 'ETH' ? 2500 : asset === 'BNB' ? 350 : 2500
      const now = new Date()
      let previousPrice = basePrice
      
      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
        const variation = (Math.random() - 0.5) * 0.05 // ±2.5% variation
        const price = basePrice * (1 + variation)
        data.push({
          timestamp: timestamp.toISOString(),
          price: price,
        })
        previousPrice = price
      }
      
      // Calculate price change
      if (data.length > 0) {
        const firstPrice = data[0].price
        const lastPrice = data[data.length - 1].price
        const change = ((lastPrice - firstPrice) / firstPrice) * 100
        setPriceChange(change)
      }
      
      setPriceData(data)
    }

    generateMockData()

    // Update every minute
    const interval = setInterval(generateMockData, 60000)
    return () => clearInterval(interval)
  }, [asset])

  const currentPrice = priceData[priceData.length - 1]?.price || 0
  const isPositive = priceChange >= 0
  const priceColor = isPositive ? '#00FF88' : '#FF4444'

  return (
    <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-xl p-6 shadow-lg shadow-electric-cyan/10 relative overflow-hidden">
      {/* Animated background glow */}
      <div 
        className="absolute inset-0 opacity-10 blur-3xl transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${priceColor} 0%, transparent 70%)`,
        }}
      />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold font-mono text-electric-cyan tracking-wide">
            {asset} Price (24h)
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-light-gray/70 font-mono">
              ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className={`text-sm font-bold font-mono px-2 py-1 rounded ${
                isPositive ? 'text-lime-green bg-lime-green/10' : 'text-sentinel-red bg-sentinel-red/10'
              }`}
              style={{
                textShadow: `0 0 8px ${priceColor}60`,
              }}
            >
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`priceGradient-${asset}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00FFFF" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#00FFFF" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#00FFFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id={`priceStroke-${asset}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00CCFF" />
                  <stop offset="50%" stopColor="#00FFFF" />
                  <stop offset="100%" stopColor="#00CCFF" />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#00FFFF" 
                opacity={0.15}
                vertical={false}
              />
              <XAxis 
                dataKey="timestamp" 
                stroke="#00FFFF"
                tick={{ fill: '#F0F0F0', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                }}
                axisLine={{ stroke: '#00FFFF', strokeWidth: 1 }}
              />
              <YAxis 
                stroke="#00FFFF"
                tick={{ fill: '#F0F0F0', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(value) => {
                  if (asset === 'BTC') {
                    return `$${(value / 1000).toFixed(0)}k`
                  }
                  if (asset === 'ETH') {
                    return `$${value.toFixed(0)}`
                  }
                  if (asset === 'BNB') {
                    return `$${value.toFixed(0)}`
                  }
                  return `$${value.toFixed(0)}`
                }}
                axisLine={{ stroke: '#00FFFF', strokeWidth: 1 }}
              />
              <ReferenceLine 
                y={priceData[0]?.price} 
                stroke="#00FFFF" 
                strokeDasharray="2 2" 
                opacity={0.5}
                label={{ value: 'Open', position: 'right', fill: '#00FFFF', fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0A1931', 
                  border: '1px solid #00FFFF',
                  borderRadius: '8px',
                  color: '#F0F0F0',
                  fontFamily: 'monospace',
                  boxShadow: '0 4px 20px rgba(0, 255, 255, 0.3)',
                }}
                labelFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                }}
                formatter={(value: any) => [
                  <span key="value" style={{ color: '#00FFFF', fontWeight: 'bold' }}>
                    ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>,
                  'Price'
                ]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={`url(#priceStroke-${asset})`}
                strokeWidth={3}
                fill={`url(#priceGradient-${asset})`}
                dot={false}
                activeDot={{ 
                  r: 6, 
                  fill: '#00FFFF',
                  stroke: '#0A1931',
                  strokeWidth: 2,
                  style: { filter: 'drop-shadow(0 0 6px #00FFFF)' }
                }}
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

