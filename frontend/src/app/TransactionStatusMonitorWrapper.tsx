/**
 * Transaction Status Monitor Wrapper
 * 
 * Client component wrapper for the transaction monitor
 */

'use client'

import { useTransactionMonitor } from '@/lib/context/TransactionContext'
import TransactionStatusMonitor from '@/components/TransactionStatusMonitor'

export default function TransactionStatusMonitorWrapper() {
  const { currentTransaction, clearTransaction } = useTransactionMonitor()

  return (
    <TransactionStatusMonitor
      transaction={currentTransaction}
      onClose={clearTransaction}
    />
  )
}

