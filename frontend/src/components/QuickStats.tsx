/**
 * Quick Stats Component
 * 
 * Displays quick statistics about the platform
 * Uses Radix UI components for accessibility
 */

'use client'

import { useEffect, useState } from 'react'
import * as Tooltip from '@/components/ui/Tooltip'
import { getTopWhales, getRecentTransactions, getCurrentLSP } from '@/lib/api'

interface Stats {
  totalWhales: number
  totalTransactions: number
  avgLSP: number
}

export default function QuickStats() {
  const [stats, setStats] = useState<Stats>({
    totalWhales: 0,
    totalTransactions: 0,
    avgLSP: 0,
  })

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        // Fetch whales, transactions, and LSP in parallel
        const [whalesData, txData, lspData] = await Promise.all([
          getTopWhales(10),
          getRecentTransactions(100),
          getCurrentLSP('BTC'),
        ])
        
        setStats({
          totalWhales: whalesData.count || 0,
          totalTransactions: txData.count || 0,
          avgLSP: lspData.score || 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Mock data for development
        setStats({
          totalWhales: 10,
          totalTransactions: 247,
          avgLSP: 2.5,
        })
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [])

  return (
    <Tooltip.TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Tooltip.Tooltip>
          <Tooltip.TooltipTrigger asChild>
            <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6 text-center cursor-help">
              <h3 className="text-lg font-mono text-electric-cyan mb-2">Tracked Whales</h3>
              <p className="text-4xl font-bold text-light-gray">{stats.totalWhales}</p>
            </div>
          </Tooltip.TooltipTrigger>
          <Tooltip.TooltipContent>
            <p>Number of identified whale wallets being tracked</p>
          </Tooltip.TooltipContent>
        </Tooltip.Tooltip>
        
        <Tooltip.Tooltip>
          <Tooltip.TooltipTrigger asChild>
            <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6 text-center cursor-help">
              <h3 className="text-lg font-mono text-electric-cyan mb-2">Large Transactions</h3>
              <p className="text-4xl font-bold text-light-gray">{stats.totalTransactions}</p>
            </div>
          </Tooltip.TooltipTrigger>
          <Tooltip.TooltipContent>
            <p>Total large transactions (&gt;$1M USD) tracked in the last 24 hours</p>
          </Tooltip.TooltipContent>
        </Tooltip.Tooltip>
        
        <Tooltip.Tooltip>
          <Tooltip.TooltipTrigger asChild>
            <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6 text-center cursor-help">
              <h3 className="text-lg font-mono text-electric-cyan mb-2">Avg LSP Score</h3>
              <p className="text-4xl font-bold text-light-gray">{stats.avgLSP.toFixed(2)}</p>
            </div>
          </Tooltip.TooltipTrigger>
          <Tooltip.TooltipContent>
            <p>Average Liquidity Shock Prediction Index score across tracked assets</p>
          </Tooltip.TooltipContent>
        </Tooltip.Tooltip>
      </div>
    </Tooltip.TooltipProvider>
  )
}

