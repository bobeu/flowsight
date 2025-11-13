/**
 * Vote Transaction Component
 * 
 * Handles voting on governance proposals
 */

'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useContractData } from '@/lib/web3/DataProvider'
import { getContractData } from '@/lib/contracts/utils'
import TransactionButton from '@/components/TransactionButton'

interface VoteTransactionProps {
  proposalId: number
  support: boolean
  onSuccess?: () => void
}

export default function VoteTransaction({ proposalId, support, onSuccess }: VoteTransactionProps) {
  const { contractAddresses, refetchProposals } = useContractData()
  const [governanceAbi, setGovernanceAbi] = useState<any[]>([])

  // Load ABI
  useEffect(() => {
    getContractData('Governance', 'hardhat').then((data) => {
      if (data) setGovernanceAbi(data.abi)
    })
  }, [])

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Handle vote success
  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess()
      refetchProposals()
    }
  }, [isSuccess, onSuccess, refetchProposals])

  const handleVote = async () => {
    if (!contractAddresses.Governance) {
      throw new Error('Governance contract not loaded')
    }

    writeContract({
      address: contractAddresses.Governance as `0x${string}`,
      abi: governanceAbi,
      functionName: 'vote',
      args: [BigInt(proposalId), support],
    })
  }

  return (
    <TransactionButton
      onClick={handleVote}
      disabled={isPending || isConfirming || governanceAbi.length === 0}
      onSuccess={() => {
        refetchProposals()
        if (onSuccess) onSuccess()
      }}
    >
      {isPending || isConfirming ? 'Processing...' : support ? 'Vote Yes' : 'Vote No'}
    </TransactionButton>
  )
}

