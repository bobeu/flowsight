/**
 * Data Provider Component
 * 
 * Fetches and provides smart contract data to the application
 * Similar to learna project's DataProvider pattern
 */

'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { useAccount, useChainId, useReadContracts } from 'wagmi'
import { formatEther, zeroAddress } from 'viem'
import { getContractData, getContractAddress } from '@/lib/contracts/utils'

interface StakingInfo {
  stakedAmount: string
  isActive: boolean
  totalRewards: string
  slashCount: number
}

interface BiddingInfo {
  bidder: string
  amount: string
  timestamp: number
  isActive: boolean
}

interface ProposalInfo {
  id: number
  proposer: string
  title: string
  description: string
  startBlock: bigint
  endBlock: bigint
  forVotes: bigint
  againstVotes: bigint
  state: number
  executed: boolean
}

interface ContractDataContextType {
  // Token data
  tokenBalance: string
  tokenBalanceLoading: boolean
  
  // Staking data
  stakingInfo: StakingInfo | null
  stakingInfoLoading: boolean
  
  // Bidding data
  getBid: (whaleAddress: string) => Promise<BiddingInfo | null>
  
  // Governance data
  proposals: ProposalInfo[]
  proposalsLoading: boolean
  
  // Contract addresses
  contractAddresses: {
    FLOWToken: string | null
    CuratorStaking: string | null
    WhaleAlertBidding: string | null
    Governance: string | null
  }
  
  // Refresh functions
  refetchTokenBalance: () => void
  refetchStakingInfo: () => void
  refetchProposals: () => void
}

const ContractDataContext = createContext<ContractDataContextType | undefined>(undefined)

export function useContractData() {
  const context = useContext(ContractDataContext)
  if (!context) {
    throw new Error('useContractData must be used within DataProvider')
  }
  return context
}

export default function DataProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const account = address || zeroAddress

  // State
  const [tokenBalance, setTokenBalance] = useState<string>('0')
  const [tokenBalanceLoading, setTokenBalanceLoading] = useState(false)
  const [stakingInfo, setStakingInfo] = useState<StakingInfo | null>(null)
  const [stakingInfoLoading, setStakingInfoLoading] = useState(false)
  const [proposals, setProposals] = useState<ProposalInfo[]>([])
  const [proposalsLoading, setProposalsLoading] = useState(false)

  // Get contract addresses
  const contractAddresses = useMemo(() => ({
    FLOWToken: getContractAddress('FLOWToken', chainId),
    CuratorStaking: getContractAddress('CuratorStaking', chainId),
    WhaleAlertBidding: getContractAddress('WhaleAlertBidding', chainId),
    Governance: getContractAddress('Governance', chainId),
  }), [chainId])

  // Load ABIs
  const [flowTokenAbi, setFlowTokenAbi] = useState<any[]>([])
  const [stakingAbi, setStakingAbi] = useState<any[]>([])

  useEffect(() => {
    getContractData('FLOWToken', 'hardhat').then((data) => {
      if (data) setFlowTokenAbi(data.abi)
    })
    getContractData('CuratorStaking', 'hardhat').then((data) => {
      if (data) setStakingAbi(data.abi)
    })
  }, [])

  // Prepare read contracts for token balance and staking info
  const readContracts = useMemo(() => {
    if (!isConnected || !contractAddresses.FLOWToken || !contractAddresses.CuratorStaking || flowTokenAbi.length === 0 || stakingAbi.length === 0) {
      return []
    }

    const contracts = []

    // FLOWToken balanceOf
    if (contractAddresses.FLOWToken) {
      contracts.push({
        address: contractAddresses.FLOWToken as `0x${string}`,
        abi: flowTokenAbi,
        functionName: 'balanceOf' as const,
        args: [account],
      })
    }

    // CuratorStaking getCuratorInfo
    if (contractAddresses.CuratorStaking) {
      contracts.push({
        address: contractAddresses.CuratorStaking as `0x${string}`,
        abi: stakingAbi,
        functionName: 'getCuratorInfo' as const,
        args: [account],
      })
    }

    return contracts
  }, [isConnected, contractAddresses, account, flowTokenAbi, stakingAbi])

  // Read contracts
  const { data: readData, refetch: refetchReads } = useReadContracts({
    contracts: readContracts,
    query: {
      enabled: isConnected && readContracts.length > 0,
      refetchInterval: 30000,
      staleTime: 15000,
    },
  })

  // Update token balance
  useEffect(() => {
    if (readData && readData[0]?.status === 'success' && readData[0].result) {
      setTokenBalance(formatEther(readData[0].result as bigint))
    } else {
      setTokenBalance('0')
    }
  }, [readData])

  // Update staking info
  useEffect(() => {
    if (readData && readData[1]?.status === 'success' && readData[1].result) {
      const info = readData[1].result as any
      setStakingInfo({
        stakedAmount: formatEther(info.stakedAmount || 0n),
        isActive: info.isActive || false,
        totalRewards: formatEther(info.totalRewards || 0n),
        slashCount: Number(info.totalSlashCount || 0n),
      })
    } else {
      setStakingInfo(null)
    }
  }, [readData])

  // Get bid function
  const getBid = useCallback(async (whaleAddress: string): Promise<BiddingInfo | null> => {
    if (!contractAddresses.WhaleAlertBidding || !isConnected) {
      return null
    }

    try {
      const contractData = await getContractData('WhaleAlertBidding', 'hardhat')
      if (!contractData) return null

      // This would need to be called via wagmi's useReadContract or useContractRead
      // For now, return null - will be implemented in transaction components
      return null
    } catch (error) {
      console.error('Error fetching bid:', error)
      return null
    }
  }, [contractAddresses.WhaleAlertBidding, isConnected])

  // Fetch proposals
  const fetchProposals = useCallback(async () => {
    if (!contractAddresses.Governance || !isConnected) {
      setProposals([])
      return
    }

    try {
      setProposalsLoading(true)
      // This will be implemented with useReadContracts
      // For now, set empty array
      setProposals([])
    } catch (error) {
      console.error('Error fetching proposals:', error)
      setProposals([])
    } finally {
      setProposalsLoading(false)
    }
  }, [contractAddresses.Governance, isConnected])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  const value: ContractDataContextType = {
    tokenBalance,
    tokenBalanceLoading,
    stakingInfo,
    stakingInfoLoading,
    getBid,
    proposals,
    proposalsLoading,
    contractAddresses,
    refetchTokenBalance: () => refetchReads(),
    refetchStakingInfo: () => refetchReads(),
    refetchProposals: fetchProposals,
  }

  return (
    <ContractDataContext.Provider value={value}>
      {children}
    </ContractDataContext.Provider>
  )
}

