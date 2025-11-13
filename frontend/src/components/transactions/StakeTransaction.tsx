/**
 * Stake Transaction Component
 * 
 * Handles staking FLOW tokens to become a Curator
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount, useChainId } from 'wagmi'
import { parseEther } from 'viem'
import { useContractData } from '@/lib/web3/DataProvider'
import { getContractData } from '@/lib/contracts/utils'
import TransactionButton from '@/components/TransactionButton'
import { parseContractError, formatErrorForDisplay } from '@/lib/utils/errorParser'

interface StakeTransactionProps {
  amount: string
  minStake: number
  onSuccess?: () => void
}

export default function StakeTransaction({ amount, minStake, onSuccess }: StakeTransactionProps) {
  const { contractAddresses, refetchStakingInfo, tokenBalance } = useContractData()
  const chainId = useChainId()
  const [flowTokenAbi, setFlowTokenAbi] = useState<any[]>([])
  const [stakingAbi, setStakingAbi] = useState<any[]>([])
  const [needsApproval, setNeedsApproval] = useState(false)

  // Load ABIs based on connected chain ID
  useEffect(() => {
    getContractData('FLOWToken', chainId).then((data) => {
      if (data) setFlowTokenAbi(data.abi)
    })
    getContractData('CuratorStaking', chainId).then((data) => {
      if (data) setStakingAbi(data.abi)
    })
  }, [chainId])

  // Get user address
  const { address } = useAccount()
  
  // Check allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: contractAddresses.FLOWToken as `0x${string}` | undefined,
    abi: flowTokenAbi,
    functionName: 'allowance',
    args: address && contractAddresses.CuratorStaking && contractAddresses.FLOWToken
      ? [
          address,
          contractAddresses.CuratorStaking as `0x${string}`,
        ]
      : undefined,
    query: {
      enabled: !!address && !!contractAddresses.FLOWToken && !!contractAddresses.CuratorStaking && flowTokenAbi.length > 0,
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

  const { writeContractAsync: writeStakeAsync, data: stakeHash, isPending: isStaking, error: stakeError } = useWriteContract()
  const { isLoading: isStakingConfirming, isSuccess: isStakeSuccess, isError: isStakeError } = useWaitForTransactionReceipt({
    hash: stakeHash,
  })

  // Update needsApproval state
  useEffect(() => {
    if (amount && allowance !== undefined) {
      try {
        const amountWei = parseEther(amount)
        const currentAllowance = allowance ? BigInt(allowance.toString()) : 0n
        setNeedsApproval(currentAllowance < amountWei)
      } catch (error) {
        setNeedsApproval(true)
      }
    }
  }, [amount, allowance])

  // Auto-stake after approval succeeds
  useEffect(() => {
    if (isApproveSuccess && contractAddresses.CuratorStaking && stakingAbi.length > 0 && amount) {
      const stake = async () => {
        try {
          const amountWei = parseEther(amount)
          await writeStakeAsync({
            address: contractAddresses.CuratorStaking as `0x${string}`,
            abi: stakingAbi,
            functionName: 'stake',
            args: [amountWei],
          })
        } catch (error) {
          console.error('Auto-stake error:', error)
        }
      }
      stake()
    }
  }, [isApproveSuccess, contractAddresses.CuratorStaking, stakingAbi, amount, writeStakeAsync])

  // Handle stake success
  useEffect(() => {
    if (isStakeSuccess) {
      refetchStakingInfo()
      refetchAllowance()
      if (onSuccess) {
        onSuccess()
      }
    }
  }, [isStakeSuccess, onSuccess, refetchStakingInfo, refetchAllowance])

  // Handle errors
  useEffect(() => {
    if (isApproveError && approveError) {
      console.error('Approval error:', approveError)
    }
    if (isStakeError && stakeError) {
      console.error('Stake error:', stakeError)
    }
  }, [isApproveError, approveError, isStakeError, stakeError])

  const handleStake = useCallback(async (): Promise<void> => {
    // Validation - return early instead of throwing
    if (!contractAddresses.CuratorStaking || !contractAddresses.FLOWToken) {
      const error = new Error('Contracts not loaded. Please ensure contracts are deployed.')
      // Let TransactionButton handle the error silently
      throw error
    }

    if (!address) {
      const error = new Error('Wallet not connected. Please connect your wallet.')
      throw error
    }

    if (!amount || parseFloat(amount) <= 0) {
      const error = new Error('Please enter a valid stake amount')
      throw error
    }

    if (parseFloat(amount) < minStake) {
      const error = new Error(`Minimum stake is ${minStake.toLocaleString()} FLOW tokens`)
      throw error
    }

    // Check balance
    if (balance) {
      const balanceWei = BigInt(balance.toString())
      const amountWei = parseEther(amount)
      if (balanceWei < amountWei) {
        const error = new Error('Insufficient FLOW token balance')
        throw error
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
            args: [contractAddresses.CuratorStaking as `0x${string}`, amountWei],
          })
          // Approval will trigger auto-stake via useEffect
        } catch (error) {
          // Parse error and throw - TransactionButton will catch and handle silently
          const parsedError = parseContractError(error)
          throw new Error(formatErrorForDisplay(parsedError))
        }
      } else {
        // Already approved, stake directly
        try {
          await writeStakeAsync({
            address: contractAddresses.CuratorStaking as `0x${string}`,
            abi: stakingAbi,
            functionName: 'stake',
            args: [amountWei],
          })
        } catch (error) {
          // Parse error and throw - TransactionButton will catch and handle silently
          const parsedError = parseContractError(error)
          throw new Error(formatErrorForDisplay(parsedError))
        }
      }
    } catch (error) {
      // Re-throw with parsed error message - TransactionButton will catch and handle silently
      if (error instanceof Error) {
        throw error
      }
      const parsedError = parseContractError(error)
      throw new Error(formatErrorForDisplay(parsedError))
    }
  }, [
    contractAddresses,
    address,
    amount,
    minStake,
    balance,
    allowance,
    flowTokenAbi,
    stakingAbi,
    writeApproveAsync,
    writeStakeAsync,
  ])

  const isLoading = isApproving || isApprovingConfirming || isStaking || isStakingConfirming

  return (
    <TransactionButton
      onClick={handleStake}
      disabled={!amount || parseFloat(amount) < minStake || isLoading || !contractAddresses.CuratorStaking || !contractAddresses.FLOWToken}
      transactionType={needsApproval && isApproving ? 'approve' : 'stake'}
      transactionMessage={needsApproval && isApproving ? 'Approving FLOW tokens for staking...' : 'Staking FLOW tokens to become a Curator...'}
      onSuccess={() => {
        refetchStakingInfo()
        refetchAllowance()
        if (onSuccess) onSuccess()
      }}
    >
      {isLoading 
        ? (needsApproval && isApproving ? 'Approving...' : 'Staking...') 
        : 'Stake FLOW Tokens'}
    </TransactionButton>
  )
}

