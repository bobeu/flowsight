/**
 * Mini LSP Chart Component
 * 
 * Small animated chart showing LSP index movement
 * Enhanced with gradients, glow effects, and smooth animations
 */

'use client'

import { useEffect, useState, useRef } from 'react'
import { ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts'

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
          value: Math.max(-10, Math.min(10, lastValue + (Math.random() - 0.5) * 0.5)),
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
    if (value >= 7) return '#FF4444'
    if (value >= 3) return '#FF8800'
    if (value >= -3) return '#00FFFF'
    if (value >= -7) return '#88FF00'
    return '#00FF88'
  }

  const getGradient = (value: number) => {
    if (value >= 7) return { start: '#FF0000', end: '#FF4444' }
    if (value >= 3) return { start: '#FF6600', end: '#FFAA00' }
    if (value >= -3) return { start: '#00CCFF', end: '#00FFFF' }
    if (value >= -7) return { start: '#66FF00', end: '#88FF00' }
    return { start: '#00FF66', end: '#00FF88' }
  }

  const currentValue = data[data.length - 1]?.value || 0
  const color = getColor(currentValue)
  const gradient = getGradient(currentValue)

  return (
    <div className="bg-midnight-blue/40 border border-electric-cyan/30 rounded-xl p-4 h-36 shadow-lg shadow-electric-cyan/5 relative overflow-hidden backdrop-blur-sm">
      {/* Animated background glow */}
      <div 
        className="absolute inset-0 opacity-10 blur-2xl transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 70%)`,
        }}
      />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-light-gray/70 font-mono tracking-wide">LSP Index (24h)</span>
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ 
                backgroundColor: color,
                boxShadow: `0 0 8px ${color}80`,
              }}
            />
            <span
              className="text-sm font-bold font-mono transition-colors duration-500"
              style={{ 
                color: color,
                textShadow: `0 0 10px ${color}60`,
              }}
            >
              {currentValue.toFixed(2)}
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="miniLspGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradient.start} stopOpacity={0.5} />
                <stop offset="50%" stopColor={gradient.start} stopOpacity={0.3} />
                <stop offset="100%" stopColor={gradient.end} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="miniLspStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={gradient.start} />
                <stop offset="100%" stopColor={gradient.end} />
              </linearGradient>
            </defs>
            <ReferenceLine y={0} stroke="#00FFFF" strokeDasharray="2 2" opacity={0.3} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={`url(#miniLspStroke)`}
              strokeWidth={2.5}
              fill="url(#miniLspGradient)"
              dot={false}
              activeDot={{ 
                r: 4, 
                fill: color,
                stroke: '#0A1931',
                strokeWidth: 1.5,
                style: { filter: `drop-shadow(0 0 4px ${color})` }
              }}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

