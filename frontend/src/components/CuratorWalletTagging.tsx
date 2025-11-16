/**
 * Curator Wallet Tagging Component
 * 
 * Allows Curators (users who have staked $FLOW) to tag and verify whale wallets
 * Implements the core utility of $FLOW token: Decentralized Data Curation
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import * as Tooltip from '@/components/ui/Tooltip'
import { useContractData } from '@/lib/web3/DataProvider'
import { useAccount } from 'wagmi'
import StakeTransaction from '@/components/transactions/StakeTransaction'
import { useTransactionMonitor } from '@/lib/context/TransactionContext'
import { createWalletTag, getCuratorStats, getWalletTags, type WalletTagResponse } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils/errorParser'
import { isAddress } from 'viem'

// interface WalletTag {
//   address: string
//   label: string
//   category: 'exchange' | 'vc' | 'institution' | 'whale' | 'nft_collector' | 'other'
//   verified: boolean
//   curatorAddress: string
//   timestamp: string
// }

interface CuratorStatus {
  isCurator: boolean
  stakedAmount: string
  totalTags: number
  verifiedTags: number
  accuracy: number
}

export default function CuratorWalletTagging() {
  const [walletAddress, setWalletAddress] = useState('')
  const [label, setLabel] = useState('')
  const [category, setCategory] = useState<string>('whale')
  const [stakeAmount, setStakeAmount] = useState('')
  const [isTagging, setIsTagging] = useState(false)
  const [walletAddressError, setWalletAddressError] = useState('')
  const [recentTags, setRecentTags] = useState<WalletTagResponse[]>([])
  const [backendStats, setBackendStats] = useState<{
    totalTags: number
    verifiedTags: number
    accuracy: number
  } | null>(null)

  const { isConnected, address } = useAccount()
  const { stakingInfo, refetchStakingInfo } = useContractData()
  const { setTransaction, updateTransactionStatus, clearTransaction } = useTransactionMonitor()

  const MIN_STAKE = 10000 // 10,000 FLOW tokens

  // Convert stakingInfo to curatorStatus format
  const curatorStatus: CuratorStatus | null = stakingInfo
    ? {
        isCurator: stakingInfo.isActive,
        stakedAmount: stakingInfo.stakedAmount,
        totalTags: backendStats?.totalTags || 0,
        verifiedTags: backendStats?.verifiedTags || 0,
        accuracy: backendStats?.accuracy || 0,
      }
    : null

  // Fetch curator stats and recent tags when curator is active
  useEffect(() => {
    if (curatorStatus?.isCurator && address) {
      const fetchCuratorData = async () => {
        try {
          // Fetch curator stats
          const stats = await getCuratorStats(address)
          
          // Update backend stats
          setBackendStats({
            totalTags: stats.total_tags,
            verifiedTags: stats.verified_tags,
            accuracy: Math.round(stats.accuracy * 100) / 100, // Round to 2 decimal places
          })
          
          // Fetch recent tags by this curator
          const tagsData = await getWalletTags({
            curator_address: address,
            limit: 10,
          })
          
          setRecentTags(tagsData.tags || [])
        } catch (error) {
          // Silently fail - backend might not be available
          console.error('Failed to fetch curator data:', error)
        }
      }
      
      fetchCuratorData()
    }
  }, [curatorStatus?.isCurator, address])

  // Validate wallet address format
  const validateWalletAddress = (addr: string): boolean => {
    if (!addr || addr.trim() === '') {
      setWalletAddressError('Wallet address is required')
      return false
    }
    
    if (!isAddress(addr.trim())) {
      setWalletAddressError('Invalid wallet address format')
      return false
    }
    
    setWalletAddressError('')
    return true
  }

  const handleTagWallet = async () => {
    // Validate inputs
    if (!walletAddress || !label.trim()) {
      return
    }

    // Validate wallet address format
    if (!validateWalletAddress(walletAddress)) {
      return
    }

    // Verify curator status
    if (!curatorStatus?.isCurator || !address) {
      const errorMsg = 'You must be an active Curator to tag wallets'
      setTransaction({
        id: `tag-error-${Date.now()}`,
        status: 'error',
        message: errorMsg,
        type: 'other',
      })
      setTimeout(() => clearTransaction(), 5000)
      return
    }

    setIsTagging(true)
    
    // Create transaction monitor entry
    const transactionId = `tag-${Date.now()}`
    setTransaction({
      id: transactionId,
      status: 'pending',
      message: 'Creating wallet tag...',
      type: 'other',
    })

    try {
      // Submit tag to backend
      const result = await createWalletTag({
        wallet_address: walletAddress.trim(),
        label: label.trim(),
        category: category as 'exchange' | 'vc' | 'institution' | 'whale' | 'nft_collector' | 'other',
        curator_address: address,
      })

      // Update transaction status to success
      updateTransactionStatus(
        transactionId,
        'success',
        `Wallet tagged successfully: ${result.tag.label}`,
      )

      // Clear form
      setWalletAddress('')
      setLabel('')
      setCategory('whale')
      setWalletAddressError('')

      // Refresh recent tags and stats
      try {
        const tagsData = await getWalletTags({
          curator_address: address,
          limit: 10,
        })
        setRecentTags(tagsData.tags || [])
        
        // Refresh curator stats
        const stats = await getCuratorStats(address)
        setBackendStats({
          totalTags: stats.total_tags,
          verifiedTags: stats.verified_tags,
          accuracy: Math.round(stats.accuracy * 100) / 100,
        })
      } catch (error) {
        // Silently fail - tags will refresh on next mount
        console.error('Failed to refresh tags:', error)
      }

      // Auto-clear success message after 5 seconds
      setTimeout(() => clearTransaction(), 5000)
    } catch (error) {
      // Handle error
      const errorMsg = getErrorMessage(error)
      updateTransactionStatus(
        transactionId,
        'error',
        errorMsg,
      )
      
      // Auto-clear error message after 5 seconds
      setTimeout(() => clearTransaction(), 5000)
    } finally {
      setIsTagging(false)
    }
  }

  const handleStakeSuccess = () => {
    setStakeAmount('')
    // Refetch staking info to update curator status
    if (refetchStakingInfo) {
      refetchStakingInfo()
    }
  }

  if (!curatorStatus?.isCurator) {
    return (
      <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold font-mono text-electric-cyan mb-4">
          Become a Curator
        </h2>
        <p className="text-light-gray mb-4">
          To tag and verify whale wallets, you must first stake a minimum of 10,000 $FLOW tokens.
        </p>
        <p className="text-light-gray/70 text-sm mb-6">
          Curators play a crucial role in creating FlowSight's decentralized data layer. 
          Accurate tags are rewarded, while false or malicious tags result in slashing (5% of staked amount).
        </p>

        {!isConnected ? (
          <div className="bg-midnight-blue/30 rounded-lg p-4 mb-4">
            <p className="text-light-gray text-sm">
              Connect your wallet to stake FLOW tokens and become a Curator.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-light-gray mb-2">Stake Amount (FLOW)</label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full bg-midnight-blue border border-electric-cyan/30 rounded px-4 py-2 text-light-gray focus:outline-none focus:border-electric-cyan font-mono"
                placeholder={`Minimum: ${MIN_STAKE.toLocaleString()}`}
              />
              {parseFloat(stakeAmount) > 0 && parseFloat(stakeAmount) < MIN_STAKE && (
                <p className="text-sentinel-red text-sm mt-1">
                  Minimum stake is {MIN_STAKE.toLocaleString()} FLOW tokens
                </p>
              )}
            </div>

            <StakeTransaction
              amount={stakeAmount}
              minStake={MIN_STAKE}
              onSuccess={handleStakeSuccess}
            />
          </>
        )}
      </div>
    )
  }

  return (
    <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold font-mono text-electric-cyan mb-2">
            Wallet Tagging
          </h2>
          <p className="text-light-gray text-sm">
            Tag and verify whale wallets to contribute to FlowSight's decentralized data layer
          </p>
        </div>
        <Badge variant="default">Active Curator</Badge>
      </div>

      {/* Curator Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-midnight-blue/30 rounded-lg p-4">
          <p className="text-light-gray/70 text-xs mb-1">Staked</p>
          <p className="text-electric-cyan font-mono text-lg">
            {parseFloat(curatorStatus.stakedAmount).toLocaleString()} FLOW
          </p>
        </div>
        <div className="bg-midnight-blue/30 rounded-lg p-4">
          <p className="text-light-gray/70 text-xs mb-1">Total Tags</p>
          <p className="text-electric-cyan font-mono text-lg">
            {curatorStatus.totalTags}
          </p>
        </div>
        <div className="bg-midnight-blue/30 rounded-lg p-4">
          <p className="text-light-gray/70 text-xs mb-1">Verified</p>
          <p className="text-electric-cyan font-mono text-lg">
            {curatorStatus.verifiedTags}
          </p>
        </div>
        <div className="bg-midnight-blue/30 rounded-lg p-4">
          <p className="text-light-gray/70 text-xs mb-1">Accuracy</p>
          <p className="text-electric-cyan font-mono text-lg">
            {curatorStatus.accuracy}%
          </p>
        </div>
      </div>

      {/* Tagging Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-light-gray mb-2">Wallet Address</label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => {
              setWalletAddress(e.target.value)
              if (walletAddressError) {
                validateWalletAddress(e.target.value)
              }
            }}
            onBlur={() => validateWalletAddress(walletAddress)}
            className={`w-full bg-midnight-blue border rounded px-4 py-2 text-light-gray focus:outline-none font-mono text-sm ${
              walletAddressError
                ? 'border-sentinel-red focus:border-sentinel-red'
                : 'border-electric-cyan/30 focus:border-electric-cyan'
            }`}
            placeholder="0x..."
          />
          {walletAddressError && (
            <p className="text-sentinel-red text-sm mt-1">{walletAddressError}</p>
          )}
        </div>

        <div>
          <label className="block text-light-gray mb-2">Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-midnight-blue border border-electric-cyan/30 rounded px-4 py-2 text-light-gray focus:outline-none focus:border-electric-cyan"
            placeholder="e.g., Binance Cold Wallet, Alameda Research"
          />
        </div>

        <div>
          <label className="block text-light-gray mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-midnight-blue border border-electric-cyan/30 rounded px-4 py-2 text-light-gray focus:outline-none focus:border-electric-cyan"
          >
            <option value="exchange">Exchange</option>
            <option value="vc">VC / Investment Fund</option>
            <option value="institution">Institution</option>
            <option value="whale">Private Whale</option>
            <option value="nft_collector">NFT Collector</option>
            <option value="other">Other</option>
          </select>
        </div>

        <Tooltip.TooltipProvider>
          <Tooltip.Tooltip>
            <Tooltip.TooltipTrigger asChild>
              <Button
                onClick={handleTagWallet}
                variant="default"
                className="w-full"
                disabled={!walletAddress || !label || isTagging || !!walletAddressError}
              >
                {isTagging ? 'Tagging...' : 'Tag Wallet'}
              </Button>
            </Tooltip.TooltipTrigger>
            <Tooltip.TooltipContent>
              <p>
                Tagging a wallet requires accuracy. False or malicious tags may result 
                in slashing (5% of your staked $FLOW). Verified tags earn rewards from 
                API revenue (10% of Tier 1 revenue distributed to Curators).
              </p>
            </Tooltip.TooltipContent>
          </Tooltip.Tooltip>
        </Tooltip.TooltipProvider>
      </div>

      {/* Recent Tags */}
      {recentTags.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-electric-cyan mb-4">
            Your Recent Tags
          </h3>
          <div className="space-y-2">
            {recentTags.map((tag) => (
              <div
                key={tag.id}
                className="bg-midnight-blue/30 border border-electric-cyan/20 rounded p-3 flex justify-between items-center"
              >
                <div>
                  <p className="text-electric-cyan font-mono text-sm mb-1">
                    {tag.wallet_address.slice(0, 10)}...{tag.wallet_address.slice(-8)}
                  </p>
                  <p className="text-light-gray text-sm">{tag.label}</p>
                  <p className="text-light-gray/60 text-xs mt-1 capitalize">{tag.category}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={tag.verified ? 'default' : 'secondary'}>
                    {tag.verified ? 'Verified' : 'Pending'}
                  </Badge>
                  {tag.dispute_count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {tag.dispute_count} dispute{tag.dispute_count > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

