/**
 * Price Chart Component
 * 
 * Displays price chart for a given asset using Recharts
 */

'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PriceData {
  timestamp: string
  price: number
}

interface PriceChartProps {
  asset: string
}

export default function PriceChart({ asset }: PriceChartProps) {
  const [priceData, setPriceData] = useState<PriceData[]>([])

  useEffect(() => {
    // Mock price data for MVP
    // In production, this would fetch from the API
    const generateMockData = () => {
      const data: PriceData[] = []
      const basePrice = asset === 'BTC' ? 45000 : 2500
      const now = new Date()
      
      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
        const variation = (Math.random() - 0.5) * 0.05 // ±2.5% variation
        data.push({
          timestamp: timestamp.toISOString(),
          price: basePrice * (1 + variation),
        })
      }
      
      setPriceData(data)
    }

    generateMockData()

    // Update every minute
    const interval = setInterval(generateMockData, 60000)
    return () => clearInterval(interval)
  }, [asset])

  return (
    <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6">
      <h3 className="text-xl font-bold font-mono text-electric-cyan mb-4">
        {asset} Price (24h)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00FFFF" opacity={0.2} />
            <XAxis 
              dataKey="timestamp" 
              stroke="#00FFFF"
              tick={{ fill: '#F0F0F0', fontSize: 10 }}
            />
            <YAxis 
              stroke="#00FFFF"
              tick={{ fill: '#F0F0F0', fontSize: 10 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0A1931', 
                border: '1px solid #00FFFF',
                color: '#F0F0F0'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#00FFFF" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

