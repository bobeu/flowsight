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
  const { contractAddresses, refetchStakingInfo } = useContractData()
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

  // Refetch allowance after approval succeeds
  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance()
    }
  }, [isApproveSuccess, refetchAllowance])

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

  // Handle approval
  const handleApprove = useCallback(async (): Promise<void> => {
    if (!contractAddresses.CuratorStaking || !contractAddresses.FLOWToken) {
      throw new Error('Contracts not loaded. Please ensure contracts are deployed.')
    }

    if (!address) {
      throw new Error('Wallet not connected. Please connect your wallet.')
    }

    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Please enter a valid stake amount')
    }

    if (parseFloat(amount) < minStake) {
      throw new Error(`Minimum stake is ${minStake.toLocaleString()} FLOW tokens`)
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
      await writeApproveAsync({
        address: contractAddresses.FLOWToken as `0x${string}`,
        abi: flowTokenAbi,
        functionName: 'approve',
        args: [contractAddresses.CuratorStaking as `0x${string}`, amountWei],
      })
    } catch (error) {
      const parsedError = parseContractError(error)
      throw new Error(formatErrorForDisplay(parsedError))
    }
  }, [
    contractAddresses,
    address,
    amount,
    minStake,
    balance,
    flowTokenAbi,
    writeApproveAsync,
  ])

  // Handle stake (only called after approval)
  const handleStake = useCallback(async (): Promise<void> => {
    if (!contractAddresses.CuratorStaking || !contractAddresses.FLOWToken) {
      throw new Error('Contracts not loaded. Please ensure contracts are deployed.')
    }

    if (!address) {
      throw new Error('Wallet not connected. Please connect your wallet.')
    }

    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Please enter a valid stake amount')
    }

    if (parseFloat(amount) < minStake) {
      throw new Error(`Minimum stake is ${minStake.toLocaleString()} FLOW tokens`)
    }

    // Verify approval is sufficient
    const amountWei = parseEther(amount)
    const currentAllowance = allowance ? BigInt(allowance.toString()) : 0n
    if (currentAllowance < amountWei) {
      throw new Error('Insufficient approval. Please approve first.')
    }

    try {
      await writeStakeAsync({
        address: contractAddresses.CuratorStaking as `0x${string}`,
        abi: stakingAbi,
        functionName: 'stake',
        args: [amountWei],
      })
    } catch (error) {
      const parsedError = parseContractError(error)
      throw new Error(formatErrorForDisplay(parsedError))
    }
  }, [
    contractAddresses,
    address,
    amount,
    minStake,
    allowance,
    stakingAbi,
    writeStakeAsync,
  ])

  const isApprovingLoading = isApproving || isApprovingConfirming
  const isStakingLoading = isStaking || isStakingConfirming

  // Check if approval is sufficient
  const hasSufficientApproval = allowance && amount ? (() => {
    try {
      const amountWei = parseEther(amount)
      const currentAllowance = BigInt(allowance.toString())
      return currentAllowance >= amountWei
    } catch {
      return false
    }
  })() : false

  // Show approve button if approval is needed and not yet sufficient
  if (needsApproval && !hasSufficientApproval) {
    return (
      <TransactionButton
        onClick={handleApprove}
        disabled={!amount || parseFloat(amount) < minStake || isApprovingLoading || !contractAddresses.CuratorStaking || !contractAddresses.FLOWToken}
        transactionType="approve"
        transactionMessage="Approving FLOW tokens for staking..."
        onSuccess={() => {
          refetchAllowance()
        }}
      >
        {isApprovingLoading ? 'Approving...' : 'Approve FLOW Tokens'}
      </TransactionButton>
    )
  }

  // Show stake button if approval is sufficient
  return (
    <TransactionButton
      onClick={handleStake}
      disabled={!amount || parseFloat(amount) < minStake || isStakingLoading || !hasSufficientApproval || !contractAddresses.CuratorStaking || !contractAddresses.FLOWToken}
      transactionType="stake"
      transactionMessage="Staking FLOW tokens to become a Curator..."
      onSuccess={() => {
        refetchStakingInfo()
        refetchAllowance()
        if (onSuccess) onSuccess()
      }}
    >
      {isStakingLoading ? 'Staking...' : 'Stake FLOW Tokens'}
    </TransactionButton>
  )
}

