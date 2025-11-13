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

interface WalletTag {
  address: string
  label: string
  category: 'exchange' | 'vc' | 'institution' | 'whale' | 'nft_collector' | 'other'
  verified: boolean
  curatorAddress: string
  timestamp: string
}

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
  const [recentTags, setRecentTags] = useState<WalletTag[]>([])

  const { isConnected } = useAccount()
  const { stakingInfo } = useContractData()

  // Convert stakingInfo to curatorStatus format
  const curatorStatus: CuratorStatus | null = stakingInfo
    ? {
        isCurator: stakingInfo.isActive,
        stakedAmount: stakingInfo.stakedAmount,
        totalTags: 0, // TODO: Fetch from backend
        verifiedTags: 0, // TODO: Fetch from backend
        accuracy: 0, // TODO: Calculate from backend data
      }
    : null

  const handleTagWallet = () => {
    // TODO: Implement wallet tagging logic
    // 1. Verify user is a Curator (has staked >= 10,000 FLOW)
    // 2. Submit tag to backend
    // 3. Backend validates and stores tag
    // 4. Community/algorithm can dispute tags
    // 5. False tags result in slashing (5% of staked amount)
    console.log('Tagging wallet:', { walletAddress, label, category })
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
        <Button variant="default" asChild>
          <a href="/flow-token">Stake $FLOW Tokens</a>
        </Button>
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
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-full bg-midnight-blue border border-electric-cyan/30 rounded px-4 py-2 text-light-gray focus:outline-none focus:border-electric-cyan font-mono text-sm"
            placeholder="0x..."
          />
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
                disabled={!walletAddress || !label}
              >
                Tag Wallet
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
            {recentTags.map((tag, index) => (
              <div
                key={index}
                className="bg-midnight-blue/30 border border-electric-cyan/20 rounded p-3 flex justify-between items-center"
              >
                <div>
                  <p className="text-electric-cyan font-mono text-sm mb-1">
                    {tag.address.slice(0, 10)}...{tag.address.slice(-8)}
                  </p>
                  <p className="text-light-gray text-sm">{tag.label}</p>
                </div>
                <Badge variant={tag.verified ? 'default' : 'secondary'}>
                  {tag.verified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

