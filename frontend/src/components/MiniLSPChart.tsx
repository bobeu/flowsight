/**
 * Mini LSP Chart Component
 * 
 * Small animated chart showing LSP index movement
 * Displays real-time data visualization capability
 */

'use client'

import { useEffect, useState, useRef } from 'react'
import { LineChart, Line, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface DataPoint {
  time: string
  value: number
}

export default function MiniLSPChart() {
  const [data, setData] = useState<DataPoint[]>([])
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Generate initial data
    const generateData = () => {
      const now = new Date()
      const points: DataPoint[] = []
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        points.push({
          time: time.toISOString(),
          value: Math.sin(i * 0.3) * 3 + Math.random() * 2 - 1,
        })
      }
      
      return points
    }

    setData(generateData())

    // Update data every 5 seconds to simulate real-time updates
    intervalRef.current = setInterval(() => {
      setData((prev) => {
        const newData = [...prev.slice(1)]
        const lastValue = prev[prev.length - 1]?.value || 0
        newData.push({
          time: new Date().toISOString(),
          value: lastValue + (Math.random() - 0.5) * 0.5,
        })
        return newData
      })
    }, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const getColor = (value: number) => {
    if (value >= 3) return '#FF8800' // Orange
    if (value >= -3) return '#00FFFF' // Electric Cyan
    return '#88FF00' // Light Green
  }

  const currentValue = data[data.length - 1]?.value || 0

  return (
    <div className="bg-midnight-blue/30 border border-electric-cyan/20 rounded-lg p-4 h-32">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-light-gray/70 font-mono">LSP Index (24h)</span>
        <span
          className="text-sm font-bold font-mono"
          style={{ color: getColor(currentValue) }}
        >
          {currentValue.toFixed(2)}
        </span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="lspGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00FFFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="#00FFFF"
            strokeWidth={2}
            fill="url(#lspGradient)"
            dot={false}
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

