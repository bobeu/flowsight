/**
 * Bid Transaction Component
 * 
 * Handles placing bids on whale wallets
 */

'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi'
import { parseEther } from 'viem'
import { useContractData } from '@/lib/web3/DataProvider'
import { getContractData } from '@/lib/contracts/utils'
import TransactionButton from '@/components/TransactionButton'

interface BidTransactionProps {
  whaleAddress: string
  amount: string
  onSuccess?: () => void
}

export default function BidTransaction({ whaleAddress, amount, onSuccess }: BidTransactionProps) {
  const { contractAddresses } = useContractData()
  const [flowTokenAbi, setFlowTokenAbi] = useState<any[]>([])
  const [biddingAbi, setBiddingAbi] = useState<any[]>([])
  const [approveHash, setApproveHash] = useState<`0x${string}` | null>(null)

  // Load ABIs
  useEffect(() => {
    getContractData('FLOWToken', 'hardhat').then((data) => {
      if (data) setFlowTokenAbi(data.abi)
    })
    getContractData('WhaleAlertBidding', 'hardhat').then((data) => {
      if (data) setBiddingAbi(data.abi)
    })
  }, [])

  // Check allowance - need to use useAccount to get the user's address
  const { address } = useAccount()
  const { data: allowance } = useReadContract({
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

  const { writeContract: writeApprove, isPending: isApproving } = useWriteContract()
  const { isLoading: isApprovingConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash || undefined,
  })

  const { writeContract: writeBid, data: bidHash, isPending: isBidding } = useWriteContract()
  const { isLoading: isBiddingConfirming, isSuccess: isBidSuccess } = useWaitForTransactionReceipt({
    hash: bidHash,
  })

  // Auto-bid after approval succeeds
  useEffect(() => {
    if (isApproveSuccess && contractAddresses.WhaleAlertBidding && biddingAbi.length > 0 && whaleAddress) {
      const amountWei = parseEther(amount)
      writeBid({
        address: contractAddresses.WhaleAlertBidding as `0x${string}`,
        abi: biddingAbi,
        functionName: 'placeBid',
        args: [whaleAddress as `0x${string}`, amountWei],
      })
    }
  }, [isApproveSuccess, contractAddresses.WhaleAlertBidding, biddingAbi, whaleAddress, amount, writeBid])

  // Handle bid success
  useEffect(() => {
    if (isBidSuccess && onSuccess) {
      onSuccess()
    }
  }, [isBidSuccess, onSuccess])

  const handleBid = async () => {
    if (!contractAddresses.WhaleAlertBidding || !contractAddresses.FLOWToken) {
      throw new Error('Contracts not loaded')
    }

    const amountWei = parseEther(amount)
    const currentAllowance = allowance ? BigInt(allowance.toString()) : 0n

    // Check if approval is needed
    if (currentAllowance < amountWei) {
      const approveTxHash = await writeApprove({
        address: contractAddresses.FLOWToken as `0x${string}`,
        abi: flowTokenAbi,
        functionName: 'approve',
        args: [contractAddresses.WhaleAlertBidding as `0x${string}`, amountWei],
      })
      if (approveTxHash) {
        setApproveHash(approveTxHash)
      }
    } else {
      // Already approved, bid directly
      writeBid({
        address: contractAddresses.WhaleAlertBidding as `0x${string}`,
        abi: biddingAbi,
        functionName: 'placeBid',
        args: [whaleAddress as `0x${string}`, amountWei],
      })
    }
  }

  const isLoading = isApproving || isApprovingConfirming || isBidding || isBiddingConfirming

  return (
    <TransactionButton
      onClick={handleBid}
      disabled={!whaleAddress || !amount || isLoading}
      onSuccess={() => {
        if (onSuccess) onSuccess()
      }}
    >
      {isLoading ? 'Processing...' : 'Place Bid'}
    </TransactionButton>
  )
}
