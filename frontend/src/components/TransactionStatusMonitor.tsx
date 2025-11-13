/**
 * Transaction Status Monitor Component
 * 
 * Displays transaction status with cool animations
 * - Desktop: Pops up to the right at the top
 * - Mobile: Modal overlay
 */

'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react'

/**
 * Format address for display (truncate middle)
 */
function formatAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export type TransactionStatus = 'pending' | 'confirming' | 'success' | 'error'

export interface TransactionMonitorData {
  id: string
  status: TransactionStatus
  message: string
  hash?: string
  type: 'approve' | 'stake' | 'bid' | 'vote' | 'unstake' | 'other'
}

interface TransactionStatusMonitorProps {
  transaction: TransactionMonitorData | null
  onClose: () => void
}

export default function TransactionStatusMonitor({
  transaction,
  onClose,
}: TransactionStatusMonitorProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (transaction) {
      setIsVisible(true)
    } else {
      // Delay hiding for smooth animation
      setTimeout(() => setIsVisible(false), 300)
    }
  }, [transaction])

  if (!transaction || !isVisible) return null

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'pending':
      case 'confirming':
        return (
          <Loader2 className="w-6 h-6 text-electric-cyan animate-spin" />
        )
      case 'success':
        return (
          <CheckCircle2 className="w-6 h-6 text-lime-green animate-pulse" />
        )
      case 'error':
        return (
          <AlertCircle className="w-6 h-6 text-sentinel-red animate-bounce" />
        )
    }
  }

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'pending':
      case 'confirming':
        return 'border-electric-cyan bg-electric-cyan/10'
      case 'success':
        return 'border-lime-green bg-lime-green/10'
      case 'error':
        return 'border-sentinel-red bg-sentinel-red/10'
    }
  }

  const getStatusText = () => {
    switch (transaction.status) {
      case 'pending':
        return 'Waiting for approval...'
      case 'confirming':
        return 'Confirming transaction...'
      case 'success':
        return 'Transaction successful!'
      case 'error':
        return 'Transaction failed'
    }
  }

  const getTransactionTypeLabel = () => {
    switch (transaction.type) {
      case 'approve':
        return 'Token Approval'
      case 'stake':
        return 'Staking'
      case 'bid':
        return 'Bidding'
      case 'vote':
        return 'Voting'
      case 'unstake':
        return 'Unstaking'
      default:
        return 'Transaction'
    }
  }

  const getExplorerUrl = () => {
    if (!transaction.hash) return null
    // For hardhat/local, you might want to use a local explorer
    // For testnets, use the appropriate explorer
    const chainId = 1337 // hardhat default, adjust as needed
    if (chainId === 1337 || chainId === 31337) {
      return `http://localhost:8545/tx/${transaction.hash}`
    }
    // Add other networks as needed
    return null
  }

  // Mobile Modal View
  if (isMobile) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-midnight-blue/95 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      >
        <div
          className={`relative w-full max-w-sm mx-4 bg-midnight-blue border-2 ${getStatusColor()} rounded-lg p-6 shadow-2xl transform transition-all duration-300 ${
            isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-light-gray hover:text-electric-cyan transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Status Icon */}
          <div className="flex justify-center mb-4">{getStatusIcon()}</div>

          {/* Status Text */}
          <h3 className="text-xl font-bold font-mono text-center text-light-gray mb-2">
            {getStatusText()}
          </h3>

          {/* Transaction Type */}
          <p className="text-sm text-light-gray/70 text-center mb-4">
            {getTransactionTypeLabel()}
          </p>

          {/* Message */}
          <p className="text-sm text-light-gray text-center mb-4 px-4 break-words overflow-wrap-anywhere">
            {transaction.message}
          </p>

          {/* Transaction Hash */}
          {transaction.hash && (
            <div className="mt-4 p-3 bg-midnight-blue/50 rounded border border-electric-cyan/30">
              <p className="text-xs text-light-gray/70 mb-1">Transaction Hash</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-mono text-electric-cyan break-all">
                  {formatAddress(transaction.hash)}
                </p>
                {getExplorerUrl() && (
                  <a
                    href={getExplorerUrl()!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-electric-cyan hover:text-electric-cyan/80 transition-colors flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Progress Bar Animation */}
          {(transaction.status === 'pending' || transaction.status === 'confirming') && (
            <div className="mt-4 h-1 bg-midnight-blue rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-electric-cyan via-electric-cyan/50 to-electric-cyan animate-pulse" style={{ width: '100%' }}>
                <div className="h-full bg-electric-cyan animate-shimmer" style={{ width: '30%', marginLeft: '-30%' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Desktop Side Panel View
  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-full pointer-events-none'
      }`}
    >
      <div
        className={`relative w-96 bg-midnight-blue border-2 ${getStatusColor()} rounded-lg p-5 shadow-2xl backdrop-blur-sm`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-light-gray hover:text-electric-cyan transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Icon and Status */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 mt-1">{getStatusIcon()}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold font-mono text-light-gray mb-1">
              {getStatusText()}
            </h3>
            <p className="text-xs text-light-gray/70 font-mono">
              {getTransactionTypeLabel()}
            </p>
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-light-gray mb-3 px-1 break-words overflow-wrap-anywhere">
          {transaction.message}
        </p>

        {/* Transaction Hash */}
        {transaction.hash && (
          <div className="mt-3 p-2 bg-midnight-blue/50 rounded border border-electric-cyan/30">
            <p className="text-xs text-light-gray/70 mb-1">Transaction Hash</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-mono text-electric-cyan truncate">
                {formatAddress(transaction.hash)}
              </p>
              {getExplorerUrl() && (
                <a
                  href={getExplorerUrl()!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-electric-cyan hover:text-electric-cyan/80 transition-colors flex-shrink-0"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar Animation */}
        {(transaction.status === 'pending' || transaction.status === 'confirming') && (
          <div className="mt-3 h-1 bg-midnight-blue rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-electric-cyan via-electric-cyan/50 to-electric-cyan relative">
              <div className="absolute inset-0 bg-electric-cyan animate-shimmer" style={{ width: '40%', marginLeft: '-40%' }}></div>
            </div>
          </div>
        )}

        {/* Pulsing Border Effect */}
        {(transaction.status === 'pending' || transaction.status === 'confirming') && (
          <div className="absolute inset-0 rounded-lg border-2 border-electric-cyan animate-pulse opacity-50 pointer-events-none"></div>
        )}
      </div>
    </div>
  )
}

