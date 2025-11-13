/**
 * LSP Gauge Component
 * 
 * Displays the Liquidity Shock Prediction Index as a gauge/chart
 * Shows score from -10 to +10 with color coding
 * Uses Radix UI components for accessibility
 */

'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { Progress } from '@/components/ui/Progress'
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
        // Mock data for development
        setHistory([
          { score: 1.5, timestamp: new Date().toISOString() },
          { score: 2.0, timestamp: new Date().toISOString() },
          { score: 2.5, timestamp: new Date().toISOString() },
        ])
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
    if (score >= 7) return '#FF0000' // Sentinel Red
    if (score >= 3) return '#FF8800' // Orange
    if (score >= -3) return '#00FFFF' // Electric Cyan
    if (score >= -7) return '#88FF00' // Light Green
    return '#00FF00' // Lime Green
  }

  const getScoreInterpretation = (score: number | null): string => {
    if (score === null) return 'No data available'
    if (score >= 7) return 'High Liquidity Shock Risk'
    if (score >= 3) return 'Moderate Risk'
    if (score >= -3) return 'Neutral'
    if (score >= -7) return 'Low Risk'
    return 'Very Low Risk'
  }

  return (
    <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6 w-full max-w-2xl">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold font-mono text-electric-cyan mb-2">
          {asset} LSP Index
        </h3>
        {currentScore !== null && (
          <>
            <div 
              className="text-6xl font-bold font-mono mb-2"
              style={{ color: getScoreColor(currentScore) }}
            >
              {currentScore.toFixed(2)}
            </div>
            <p className="text-light-gray">
              {getScoreInterpretation(currentScore)}
            </p>
          </>
        )}
      </div>

      {/* Gauge Visualization */}
      {currentScore !== null && (
        <Tooltip.TooltipProvider>
          <Tooltip.Tooltip>
            <Tooltip.TooltipTrigger asChild>
              <div className="mb-6">
                <Progress 
                  value={((currentScore + 10) / 20) * 100} 
                  className="mb-2"
                  style={{
                    '--progress-background': getScoreColor(currentScore),
                  } as React.CSSProperties}
                />
                <div className="flex justify-between text-xs text-light-gray/70 mt-1">
                  <span>-10</span>
                  <span>0</span>
                  <span>+10</span>
                </div>
              </div>
            </Tooltip.TooltipTrigger>
            <Tooltip.TooltipContent>
              <p>LSP Score: {currentScore.toFixed(2)} ({getScoreInterpretation(currentScore)})</p>
            </Tooltip.TooltipContent>
          </Tooltip.Tooltip>
        </Tooltip.TooltipProvider>
      )}

      {/* History Chart */}
      {history.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00FFFF" opacity={0.2} />
              <XAxis 
                dataKey="timestamp" 
                stroke="#00FFFF"
                tick={{ fill: '#F0F0F0', fontSize: 12 }}
              />
              <YAxis 
                domain={[-10, 10]}
                stroke="#00FFFF"
                tick={{ fill: '#F0F0F0', fontSize: 12 }}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: '#0A1931', 
                  border: '1px solid #00FFFF',
                  color: '#F0F0F0'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#00FFFF" 
                strokeWidth={2}
                dot={{ fill: '#00FFFF', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

