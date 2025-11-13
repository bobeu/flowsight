/**
 * Transaction Button Component
 * 
 * Reusable button component for contract transactions
 * Handles loading states, error handling, and transaction confirmation
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import * as Tooltip from '@/components/ui/Tooltip'
import { getErrorMessage } from '@/lib/utils/errorParser'
import { useTransactionMonitor } from '@/lib/context/TransactionContext'

interface TransactionButtonProps {
  onClick: () => Promise<void>
  disabled?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
  children: React.ReactNode
  tooltip?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
  transactionType?: 'approve' | 'stake' | 'bid' | 'vote' | 'unstake' | 'other'
  transactionMessage?: string
}

export default function TransactionButton({
  onClick,
  disabled = false,
  variant = 'default',
  className = '',
  children,
  tooltip,
  onSuccess,
  onError,
  transactionType = 'other',
  transactionMessage,
}: TransactionButtonProps) {
  const [loading, setLoading] = useState(false)
  const { setTransaction, updateTransactionStatus, clearTransaction } = useTransactionMonitor()

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default form submission behavior
    e.preventDefault()
    e.stopPropagation()

    if (loading || disabled) return

    const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const defaultMessage = transactionMessage || `Processing ${transactionType} transaction...`

    try {
      setLoading(true)

      // Show pending transaction
      setTransaction({
        id: transactionId,
        status: 'pending',
        message: defaultMessage,
        type: transactionType,
      })

      await onClick()

      // Update to confirming
      updateTransactionStatus(transactionId, 'confirming', 'Waiting for blockchain confirmation...')

      // Success - show success message
      setTimeout(() => {
        updateTransactionStatus(
          transactionId,
          'success',
          getSuccessMessage(transactionType)
        )
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          clearTransaction()
        }, 3000)
      }, 500)

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      // Fail silently - only show error in popup monitor
      try {
        // Get only the error message string
        const errorMessage = getErrorMessage(err)

        // Update transaction to error state (only in popup)
        updateTransactionStatus(transactionId, 'error', errorMessage)

        // Auto-close error after 5 seconds
        setTimeout(() => {
          clearTransaction()
        }, 5000)

        // Call onError callback if provided, but don't throw
        if (onError) {
          try {
            onError(new Error(errorMessage))
          } catch (callbackError) {
            // Silently handle callback errors
            console.error('Error in onError callback:', callbackError)
          }
        } else {
          // Only log to console, don't break the app
          console.error('Transaction error:', err)
        }
      } catch (parseError) {
        // Even error parsing should fail silently
        console.error('Error parsing transaction error:', parseError)
        updateTransactionStatus(transactionId, 'error', 'An unexpected error occurred')
        setTimeout(() => {
          clearTransaction()
        }, 5000)
      }
    } finally {
      setLoading(false)
    }
  }

  const button = (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      variant={variant}
      className={`w-full ${className}`}
    >
      {loading ? 'Processing...' : children}
    </Button>
  )

  if (tooltip) {
    return (
      <Tooltip.TooltipProvider>
        <Tooltip.Tooltip>
          <Tooltip.TooltipTrigger asChild>
            {button}
          </Tooltip.TooltipTrigger>
          <Tooltip.TooltipContent>
            <p>{tooltip}</p>
          </Tooltip.TooltipContent>
        </Tooltip.Tooltip>
      </Tooltip.TooltipProvider>
    )
  }

  return button
}

/**
 * Get success message based on transaction type
 */
function getSuccessMessage(type: string): string {
  switch (type) {
    case 'approve':
      return 'Token approval successful! You can now proceed with the transaction.'
    case 'stake':
      return 'Staking successful! You are now a Curator.'
    case 'bid':
      return 'Bid placed successfully! Your whale alert has been boosted.'
    case 'vote':
      return 'Vote cast successfully! Your governance participation has been recorded.'
    case 'unstake':
      return 'Unstaking successful! Your tokens have been returned.'
    default:
      return 'Transaction completed successfully!'
  }
}

