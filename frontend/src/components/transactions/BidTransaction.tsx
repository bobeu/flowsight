/**
 * Bid Transaction Component
 * 
 * Handles placing bids on whale wallets
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount, useChainId } from 'wagmi'
import { parseEther } from 'viem'
import { useContractData } from '@/lib/web3/DataProvider'
import { getContractData } from '@/lib/contracts/utils'
import TransactionButton from '@/components/TransactionButton'
import { parseContractError, formatErrorForDisplay } from '@/lib/utils/errorParser'

interface BidTransactionProps {
  whaleAddress: string
  amount: string
  onSuccess?: () => void
}

export default function BidTransaction({ whaleAddress, amount, onSuccess }: BidTransactionProps) {
  const { contractAddresses } = useContractData()
  const chainId = useChainId()
  const [flowTokenAbi, setFlowTokenAbi] = useState<any[]>([])
  const [biddingAbi, setBiddingAbi] = useState<any[]>([])

  // Load ABIs based on connected chain ID
  useEffect(() => {
    getContractData('FLOWToken', chainId).then((data) => {
      if (data) setFlowTokenAbi(data.abi)
    })
    getContractData('WhaleAlertBidding', chainId).then((data) => {
      if (data) setBiddingAbi(data.abi)
    })
  }, [chainId])

  // Get user address
  const { address } = useAccount()
  
  // Check allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: contractAddresses.FLOWToken as `0x${string}` | undefined,
    abi: flowTokenAbi,
    functionName: 'allowance',
    args: address && contractAddresses.WhaleAlertBidding && contractAddresses.FLOWToken
      ? [
          address,
          contractAddresses.WhaleAlertBidding as `0x${string}`,
        ]
      : undefined,
    query: {
      enabled: !!address && !!contractAddresses.FLOWToken && !!contractAddresses.WhaleAlertBidding && flowTokenAbi.length > 0,
    },
  })

  // Check token balance
  const { data: balance } = useReadContract({
    address: contractAddresses.FLOWToken as `0x${string}` | undefined,
    abi: flowTokenAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddresses.FLOWToken && flowTokenAbi.length > 0,
    },
  })

  const { writeContractAsync: writeApproveAsync, data: approveHashData, isPending: isApproving, error: approveError } = useWriteContract()
  const { isLoading: isApprovingConfirming, isSuccess: isApproveSuccess, isError: isApproveError } = useWaitForTransactionReceipt({
    hash: approveHashData,
  })

  const { writeContractAsync: writeBidAsync, data: bidHash, isPending: isBidding, error: bidError } = useWriteContract()
  const { isLoading: isBiddingConfirming, isSuccess: isBidSuccess, isError: isBidError } = useWaitForTransactionReceipt({
    hash: bidHash,
  })

  // Auto-bid after approval succeeds
  useEffect(() => {
    if (isApproveSuccess && contractAddresses.WhaleAlertBidding && biddingAbi.length > 0 && whaleAddress && amount) {
      const bid = async () => {
        try {
          const amountWei = parseEther(amount)
          await writeBidAsync({
            address: contractAddresses.WhaleAlertBidding as `0x${string}`,
            abi: biddingAbi,
            functionName: 'placeBid',
            args: [whaleAddress as `0x${string}`, amountWei],
          })
        } catch (error) {
          console.error('Auto-bid error:', error)
        }
      }
      bid()
    }
  }, [isApproveSuccess, contractAddresses.WhaleAlertBidding, biddingAbi, whaleAddress, amount, writeBidAsync])

  // Handle bid success
  useEffect(() => {
    if (isBidSuccess) {
      refetchAllowance()
      if (onSuccess) {
        onSuccess()
      }
    }
  }, [isBidSuccess, onSuccess, refetchAllowance])

  // Handle errors
  useEffect(() => {
    if (isApproveError && approveError) {
      console.error('Approval error:', approveError)
    }
    if (isBidError && bidError) {
      console.error('Bid error:', bidError)
    }
  }, [isApproveError, approveError, isBidError, bidError])

  const handleBid = useCallback(async (): Promise<void> => {
    // Validation
    if (!contractAddresses.WhaleAlertBidding || !contractAddresses.FLOWToken) {
      throw new Error('Contracts not loaded. Please ensure contracts are deployed.')
    }

    if (!address) {
      throw new Error('Wallet not connected. Please connect your wallet.')
    }

    if (!whaleAddress || !whaleAddress.startsWith('0x')) {
      throw new Error('Please enter a valid whale wallet address')
    }

    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Please enter a valid bid amount')
    }

    if (parseFloat(amount) < 100) {
      throw new Error('Minimum bid is 100 FLOW tokens')
    }

    // Check balance
    if (balance) {
      const balanceWei = BigInt(balance.toString())
      const amountWei = parseEther(amount)
      if (balanceWei < amountWei) {
        throw new Error('Insufficient FLOW token balance')
      }
    }

    try {
      const amountWei = parseEther(amount)
      const currentAllowance = allowance ? BigInt(allowance.toString()) : 0n

      // Check if approval is needed
      if (currentAllowance < amountWei) {
        // Approve first
        try {
          await writeApproveAsync({
            address: contractAddresses.FLOWToken as `0x${string}`,
            abi: flowTokenAbi,
            functionName: 'approve',
            args: [contractAddresses.WhaleAlertBidding as `0x${string}`, amountWei],
          })
          // Approval will trigger auto-bid via useEffect
        } catch (error) {
          const parsedError = parseContractError(error)
          throw new Error(formatErrorForDisplay(parsedError))
        }
      } else {
        // Already approved, bid directly
        try {
          await writeBidAsync({
            address: contractAddresses.WhaleAlertBidding as `0x${string}`,
            abi: biddingAbi,
            functionName: 'placeBid',
            args: [whaleAddress as `0x${string}`, amountWei],
          })
        } catch (error) {
          const parsedError = parseContractError(error)
          throw new Error(formatErrorForDisplay(parsedError))
        }
      }
    } catch (error) {
      // Re-throw with parsed error message
      if (error instanceof Error) {
        throw error
      }
      const parsedError = parseContractError(error)
      throw new Error(formatErrorForDisplay(parsedError))
    }
  }, [
    contractAddresses,
    address,
    whaleAddress,
    amount,
    balance,
    allowance,
    flowTokenAbi,
    biddingAbi,
    writeApproveAsync,
    writeBidAsync,
  ])

  const isLoading = isApproving || isApprovingConfirming || isBidding || isBiddingConfirming

  return (
    <TransactionButton
      onClick={handleBid}
      disabled={!whaleAddress || !amount || parseFloat(amount) < 100 || isLoading || !contractAddresses.WhaleAlertBidding || !contractAddresses.FLOWToken}
      transactionType={isApproving ? 'approve' : 'bid'}
      transactionMessage={isApproving ? 'Approving FLOW tokens for bidding...' : 'Placing bid to boost whale alert...'}
      onSuccess={() => {
        refetchAllowance()
        if (onSuccess) onSuccess()
      }}
    >
      {isLoading 
        ? (isApproving ? 'Approving...' : 'Placing Bid...') 
        : 'Place Bid'}
    </TransactionButton>
  )
}
