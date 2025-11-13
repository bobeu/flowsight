/**
 * Stake Transaction Component
 * 
 * Handles staking FLOW tokens to become a Curator
 */

'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { useContractData } from '@/lib/web3/DataProvider'
import { getContractData } from '@/lib/contracts/utils'
import TransactionButton from '@/components/TransactionButton'

interface StakeTransactionProps {
  amount: string
  minStake: number
  onSuccess?: () => void
}

export default function StakeTransaction({ amount, minStake, onSuccess }: StakeTransactionProps) {
  const { contractAddresses, refetchStakingInfo } = useContractData()
  const [flowTokenAbi, setFlowTokenAbi] = useState<any[]>([])
  const [stakingAbi, setStakingAbi] = useState<any[]>([])
  const [approveHash, setApproveHash] = useState<`0x${string}` | null>(null)

  // Load ABIs
  useEffect(() => {
    getContractData('FLOWToken', 'hardhat').then((data) => {
      if (data) setFlowTokenAbi(data.abi)
    })
    getContractData('CuratorStaking', 'hardhat').then((data) => {
      if (data) setStakingAbi(data.abi)
    })
  }, [])

  // Get user address
  const { address } = useAccount()
  
  // Check allowance
  const { data: allowance } = useReadContract({
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

  const { writeContract: writeApprove, isPending: isApproving } = useWriteContract()
  const { isLoading: isApprovingConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash || undefined,
  })

  const { writeContract: writeStake, data: stakeHash, isPending: isStaking } = useWriteContract()
  const { isLoading: isStakingConfirming, isSuccess: isStakeSuccess } = useWaitForTransactionReceipt({
    hash: stakeHash,
  })

  // Auto-stake after approval succeeds
  useEffect(() => {
    if (isApproveSuccess && contractAddresses.CuratorStaking && stakingAbi.length > 0) {
      const amountWei = parseEther(amount)
      writeStake({
        address: contractAddresses.CuratorStaking as `0x${string}`,
        abi: stakingAbi,
        functionName: 'stake',
        args: [amountWei],
      })
    }
  }, [isApproveSuccess, contractAddresses.CuratorStaking, stakingAbi, amount, writeStake])

  // Handle stake success
  useEffect(() => {
    if (isStakeSuccess && onSuccess) {
      onSuccess()
      refetchStakingInfo()
    }
  }, [isStakeSuccess, onSuccess, refetchStakingInfo])

  const handleStake = async () => {
    if (!contractAddresses.CuratorStaking || !contractAddresses.FLOWToken) {
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
        args: [contractAddresses.CuratorStaking as `0x${string}`, amountWei],
      })
      if (approveTxHash) {
        setApproveHash(approveTxHash)
      }
    } else {
      // Already approved, stake directly
      writeStake({
        address: contractAddresses.CuratorStaking as `0x${string}`,
        abi: stakingAbi,
        functionName: 'stake',
        args: [amountWei],
      })
    }
  }

  const isLoading = isApproving || isApprovingConfirming || isStaking || isStakingConfirming

  return (
    <TransactionButton
      onClick={handleStake}
      disabled={!amount || parseFloat(amount) < minStake || isLoading}
      onSuccess={() => {
        refetchStakingInfo()
        if (onSuccess) onSuccess()
      }}
      onError={(error) => {
        console.error('Staking error:', error)
      }}
    >
      {isLoading ? 'Processing...' : 'Stake FLOW Tokens'}
    </TransactionButton>
  )
}

