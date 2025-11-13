/**
 * Whale Table Component
 * 
 * Displays a table of top whale wallets with their holdings
 * Uses Radix UI components for accessibility
 */

'use client'

import { useEffect, useState } from 'react'
import * as Tooltip from '@/components/ui/Tooltip'
import { Badge } from '@/components/ui/Badge'
import { getTopWhales, type Whale } from '@/lib/api'

export default function WhaleTable() {
  const [whales, setWhales] = useState<Whale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWhales = async () => {
      try {
        const data = await getTopWhales(10)
        
        if (data.whales) {
          setWhales(data.whales)
        }
      } catch (error) {
        console.error('Error fetching whales:', error)
        // Mock data for development
        setWhales([
          {
            address: '0x1234567890123456789012345678901234567890',
            label: 'Binance Cold Wallet',
            total_holdings_usd: 50000000,
            is_exchange: true,
            curator_address: null,
          },
          {
            address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
            label: 'Whale Wallet #1',
            total_holdings_usd: 25000000,
            is_exchange: false,
            curator_address: '0x1111111111111111111111111111111111111111',
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchWhales()
    const interval = setInterval(fetchWhales, 60000) // Update every minute
    
    return () => clearInterval(interval)
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

  if (loading) {
    return (
      <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6">
        <p className="text-light-gray">Loading whales...</p>
      </div>
    )
  }

  return (
    <Tooltip.TooltipProvider>
      <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-midnight-blue">
              <tr>
                <th className="px-4 py-3 text-left text-electric-cyan font-mono text-sm">Address</th>
                <th className="px-4 py-3 text-left text-electric-cyan font-mono text-sm">Label</th>
                <th className="px-4 py-3 text-right text-electric-cyan font-mono text-sm">Holdings</th>
                <th className="px-4 py-3 text-center text-electric-cyan font-mono text-sm">Type</th>
              </tr>
            </thead>
            <tbody>
              {whales.map((whale) => (
                <tr 
                  key={whale.address}
                  className="border-t border-electric-cyan/10 hover:bg-midnight-blue/30 transition-colors"
                >
                  <td className="px-4 py-3 text-light-gray font-mono text-xs">
                    <Tooltip.Tooltip>
                      <Tooltip.TooltipTrigger asChild>
                        <span className="cursor-help underline decoration-dotted">
                          {formatAddress(whale.address)}
                        </span>
                      </Tooltip.TooltipTrigger>
                      <Tooltip.TooltipContent>
                        <p className="font-mono text-xs">{whale.address}</p>
                      </Tooltip.TooltipContent>
                    </Tooltip.Tooltip>
                  </td>
                  <td className="px-4 py-3 text-light-gray">
                    {whale.label || 'Unlabeled'}
                  </td>
                  <td className="px-4 py-3 text-right text-electric-cyan font-mono">
                    {formatUSD(whale.total_holdings_usd)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {whale.is_exchange ? (
                      <Badge variant="default">Exchange</Badge>
                    ) : (
                      <Badge variant="secondary">Whale</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {whales.length === 0 && (
          <div className="p-6 text-center text-light-gray">
            No whale wallets found
          </div>
        )}
      </div>
    </Tooltip.TooltipProvider>
  )
}

