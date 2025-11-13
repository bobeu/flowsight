/**
 * Transaction Context
 * 
 * Manages transaction status monitoring across the application
 */

'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { TransactionMonitorData, TransactionStatus } from '@/components/TransactionStatusMonitor'

interface TransactionContextType {
  currentTransaction: TransactionMonitorData | null
  setTransaction: (transaction: TransactionMonitorData | null) => void
  updateTransactionStatus: (id: string, status: TransactionStatus, message?: string, hash?: string) => void
  clearTransaction: () => void
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function useTransactionMonitor() {
  const context = useContext(TransactionContext)
  if (!context) {
    throw new Error('useTransactionMonitor must be used within TransactionProvider')
  }
  return context
}

export default function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [currentTransaction, setCurrentTransaction] = useState<TransactionMonitorData | null>(null)

  const setTransaction = useCallback((transaction: TransactionMonitorData | null) => {
    setCurrentTransaction(transaction)
  }, [])

  const updateTransactionStatus = useCallback((
    id: string,
    status: TransactionStatus,
    message?: string,
    hash?: string
  ) => {
    setCurrentTransaction((prev) => {
      if (prev && prev.id === id) {
        return {
          ...prev,
          status,
          message: message || prev.message,
          hash: hash || prev.hash,
        }
      }
      return prev
    })
  }, [])

  const clearTransaction = useCallback(() => {
    setCurrentTransaction(null)
  }, [])

  const value: TransactionContextType = {
    currentTransaction,
    setTransaction,
    updateTransactionStatus,
    clearTransaction,
  }

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  )
}

