/**
 * Connection Status Component
 * 
 * Displays the backend API connection status
 * Shows whether the backend is reachable and responding
 */

'use client'

import { useEffect, useState } from 'react'
import * as Tooltip from '@/components/ui/Tooltip'
import { Badge } from '@/components/ui/Badge'

type ConnectionStatus = 'connected' | 'disconnected' | 'checking'

export default function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('checking')
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkConnection = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      if (response.ok) {
        setStatus('connected')
        setLastChecked(new Date())
      } else {
        setStatus('disconnected')
        setLastChecked(new Date())
      }
    } catch (error) {
      setStatus('disconnected')
      setLastChecked(new Date())
    }
  }

  useEffect(() => {
    // Check immediately
    checkConnection()

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-lime-green'
      case 'disconnected':
        return 'bg-sentinel-red'
      case 'checking':
        return 'bg-orange'
      default:
        return 'bg-light-gray'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Backend Connected'
      case 'disconnected':
        return 'Backend Disconnected'
      case 'checking':
        return 'Checking...'
      default:
        return 'Unknown'
    }
  }

  const getStatusDescription = () => {
    switch (status) {
      case 'connected':
        return `Backend API is reachable and responding. Last checked: ${lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}`
      case 'disconnected':
        return `Backend API is not reachable. Check if the backend server is running. Last checked: ${lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}`
      case 'checking':
        return 'Checking backend connection status...'
      default:
        return 'Unknown connection status'
    }
  }

  return (
    <Tooltip.TooltipProvider>
      <Tooltip.Tooltip>
        <Tooltip.TooltipTrigger asChild>
          <div className="flex items-center space-x-2 cursor-help">
            <div
              className={`w-2 h-2 rounded-full ${getStatusColor()} ${
                status === 'connected' ? 'animate-pulse' : ''
              }`}
            />
            <Badge
              variant={status === 'connected' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {getStatusText()}
            </Badge>
          </div>
        </Tooltip.TooltipTrigger>
        <Tooltip.TooltipContent>
          <p className="max-w-xs">{getStatusDescription()}</p>
        </Tooltip.TooltipContent>
      </Tooltip.Tooltip>
    </Tooltip.TooltipProvider>
  )
}

