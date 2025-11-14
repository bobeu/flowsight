/**
 * LSP Gauge Component
 * 
 * Displays the Liquidity Shock Prediction Index as a gauge/chart
 * Shows score from -10 to +10 with color coding
 * Enhanced with gradients, animations, and glow effects
 */

'use client'

import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import * as Tooltip from '@/components/ui/Tooltip'
import { getCurrentLSP, getLSPHistory } from '@/lib/api'

interface LSPData {
  score: number
  timestamp: string
}

interface LSPGaugeProps {
  asset: string
}

export default function LSPGauge({ asset }: LSPGaugeProps) {
  const [currentScore, setCurrentScore] = useState<number | null>(null)
  const [history, setHistory] = useState<LSPData[]>([])

  useEffect(() => {
    // Fetch current LSP score
    const fetchLSP = async () => {
      try {
        const data = await getCurrentLSP(asset)
        
        if (data.score !== null) {
          setCurrentScore(data.score)
        }
      } catch (error) {
        console.error('Error fetching LSP score:', error)
        // Mock data for development
        setCurrentScore(2.5)
      }
    }

    // Fetch LSP history
    const fetchHistory = async () => {
      try {
        const data = await getLSPHistory(asset, 24)
        
        if (data.data) {
          setHistory(data.data)
        }
      } catch (error) {
        console.error('Error fetching LSP history:', error)
        // Generate mock data for development
        const mockData: LSPData[] = []
        const now = new Date()
        for (let i = 23; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 60 * 60 * 1000)
          mockData.push({
            score: Math.sin(i * 0.3) * 3 + Math.random() * 2 - 1,
            timestamp: time.toISOString(),
          })
        }
        setHistory(mockData)
      }
    }

    fetchLSP()
    fetchHistory()

    // Update every 30 seconds
    const interval = setInterval(() => {
      fetchLSP()
      fetchHistory()
    }, 30000)

    return () => clearInterval(interval)
  }, [asset])

  const getScoreColor = (score: number | null): string => {
    if (score === null) return '#F0F0F0'
    if (score >= 7) return '#FF4444' // Sentinel Red
    if (score >= 3) return '#FF8800' // Orange
    if (score >= -3) return '#00FFFF' // Electric Cyan
    if (score >= -7) return '#88FF00' // Light Green
    return '#00FF88' // Lime Green
  }

  const getScoreGradient = (score: number | null): { start: string; end: string } => {
    if (score === null) return { start: '#F0F0F0', end: '#F0F0F0' }
    if (score >= 7) return { start: '#FF0000', end: '#FF4444' }
    if (score >= 3) return { start: '#FF6600', end: '#FFAA00' }
    if (score >= -3) return { start: '#00CCFF', end: '#00FFFF' }
    if (score >= -7) return { start: '#66FF00', end: '#88FF00' }
    return { start: '#00FF66', end: '#00FF88' }
  }

  const getScoreInterpretation = (score: number | null): string => {
    if (score === null) return 'No data available'
    if (score >= 7) return 'High Liquidity Shock Risk'
    if (score >= 3) return 'Moderate Risk'
    if (score >= -3) return 'Neutral'
    if (score >= -7) return 'Low Risk'
    return 'Very Low Risk'
  }

  const scoreColor = currentScore !== null ? getScoreColor(currentScore) : '#F0F0F0'
  const gradient = currentScore !== null ? getScoreGradient(currentScore) : { start: '#F0F0F0', end: '#F0F0F0' }

  return (
    <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-xl p-6 w-full max-w-2xl shadow-lg shadow-electric-cyan/10 relative overflow-hidden">
      {/* Animated background glow */}
      <div 
        className="absolute inset-0 opacity-20 blur-3xl transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${scoreColor} 0%, transparent 70%)`,
        }}
      />
      
      <div className="relative z-10">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold font-mono text-electric-cyan mb-4 tracking-wide">
            {asset} LSP Index
          </h3>
          {currentScore !== null && (
            <>
              <div className="relative inline-block">
                <div 
                  className="text-7xl font-bold font-mono mb-2 transition-all duration-500 drop-shadow-lg"
                  style={{ 
                    color: scoreColor,
                    textShadow: `0 0 20px ${scoreColor}40, 0 0 40px ${scoreColor}20`,
                  }}
                >
                  {currentScore.toFixed(2)}
                </div>
                <div 
                  className="absolute inset-0 blur-xl opacity-50 transition-all duration-500"
                  style={{ color: scoreColor }}
                >
                  {currentScore.toFixed(2)}
                </div>
              </div>
              <p className="text-light-gray text-lg font-medium">
                {getScoreInterpretation(currentScore)}
              </p>
            </>
          )}
        </div>

        {/* Enhanced Gauge Visualization */}
        {currentScore !== null && (
          <Tooltip.TooltipProvider>
            <Tooltip.Tooltip>
              <Tooltip.TooltipTrigger asChild>
                <div className="mb-8 relative">
                  <div className="relative h-4 bg-midnight-blue/80 rounded-full overflow-hidden border border-electric-cyan/20">
                    {/* Gradient fill */}
                    <div
                      className="absolute inset-y-0 left-0 transition-all duration-1000 ease-out rounded-full"
                      style={{
                        width: `${((currentScore + 10) / 20) * 100}%`,
                        background: `linear-gradient(90deg, ${gradient.start}, ${gradient.end})`,
                        boxShadow: `0 0 20px ${scoreColor}60, inset 0 0 10px ${scoreColor}40`,
                      }}
                    />
                    {/* Animated shimmer effect */}
                    <div
                      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                      style={{
                        left: `${((currentScore + 10) / 20) * 100 - 33}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-light-gray/70 mt-2 font-mono">
                    <span className="text-sentinel-red">-10 (High Risk)</span>
                    <span className="text-electric-cyan">0 (Neutral)</span>
                    <span className="text-lime-green">+10 (Low Risk)</span>
                  </div>
                </div>
              </Tooltip.TooltipTrigger>
              <Tooltip.TooltipContent>
                <p className="font-mono">LSP Score: {currentScore.toFixed(2)}</p>
                <p className="text-sm text-light-gray/80">{getScoreInterpretation(currentScore)}</p>
              </Tooltip.TooltipContent>
            </Tooltip.Tooltip>
          </Tooltip.TooltipProvider>
        )}

        {/* Enhanced History Chart with Area Gradient */}
        {history.length > 0 && (
          <div className="h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`lspGradient-${asset}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={gradient.start} stopOpacity={0.4} />
                    <stop offset="50%" stopColor={gradient.start} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={gradient.end} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={`lspStroke-${asset}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={gradient.start} />
                    <stop offset="100%" stopColor={gradient.end} />
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
                  domain={[-10, 10]}
                  stroke="#00FFFF"
                  tick={{ fill: '#F0F0F0', fontSize: 11, fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#00FFFF', strokeWidth: 1 }}
                />
                <ReferenceLine y={0} stroke="#00FFFF" strokeDasharray="2 2" opacity={0.5} />
                <RechartsTooltip 
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
                    <span key="value" style={{ color: scoreColor, fontWeight: 'bold' }}>
                      {Number(value).toFixed(2)}
                    </span>,
                    'LSP Score'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke={`url(#lspStroke-${asset})`}
                  strokeWidth={3}
                  fill={`url(#lspGradient-${asset})`}
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    fill: scoreColor,
                    stroke: '#0A1931',
                    strokeWidth: 2,
                    style: { filter: `drop-shadow(0 0 6px ${scoreColor})` }
                  }}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

