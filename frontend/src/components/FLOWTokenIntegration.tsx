/**
 * FLOW Token Integration Component
 * 
 * Provides UI for $FLOW token utilities:
 * 1. Data Curation Staking
 * 2. Premium Access Payment
 * 3. Whale Alert Bidding
 * 4. Governance Voting
 */

'use client'

import { useState, useEffect } from 'react'
import { Lock, CreditCard, Zap, Vote, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import * as Tooltip from '@/components/ui/Tooltip'
import { Progress } from '@/components/ui/Progress'
import { useContractData } from '@/lib/web3/DataProvider'
import { useAccount, useReadContract, useChainId } from 'wagmi'
import { formatEther } from 'viem'
import StakeTransaction from '@/components/transactions/StakeTransaction'
import BidTransaction from '@/components/transactions/BidTransaction'
import VoteTransaction from '@/components/transactions/VoteTransaction'
import { getContractData } from '@/lib/contracts/utils'

// interface StakingInfo {
//   stakedAmount: string
//   isCurator: boolean
//   totalRewards: string
//   slashCount: number
// }

interface BiddingInfo {
  bidder: string
  amount: string
  timestamp: number
  isActive: boolean
}

export default function FLOWTokenIntegration() {
  const [activeTab, setActiveTab] = useState<'staking' | 'payment' | 'bidding' | 'governance'>('staking')
  const [stakeAmount, setStakeAmount] = useState('')
  const [bidAmount, setBidAmount] = useState('')
  const [selectedWallet, setSelectedWallet] = useState('')
  const [biddingInfo, setBiddingInfo] = useState<BiddingInfo | null>(null)

  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { stakingInfo, contractAddresses, proposals } = useContractData()
  const [biddingAbi, setBiddingAbi] = useState<any[]>([])

  // Load bidding ABI based on connected chain ID
  useEffect(() => {
    getContractData('WhaleAlertBidding', chainId).then((data: { address: string; abi: any[] } | null) => {
      if (data) setBiddingAbi(data.abi)
    })
  }, [chainId])

  // Fetch bid info using useReadContract
  const { data: bidData } = useReadContract({
    address: contractAddresses.WhaleAlertBidding as `0x${string}` | undefined,
    abi: biddingAbi,
    functionName: 'getHighestBid',
    args: selectedWallet && selectedWallet.startsWith('0x') ? [selectedWallet as `0x${string}`] : undefined,
    query: {
      enabled: !!selectedWallet && selectedWallet.startsWith('0x') && !!contractAddresses.WhaleAlertBidding && biddingAbi.length > 0,
    },
  })

  // Update biddingInfo when bidData changes
  useEffect(() => {
    if (bidData && Array.isArray(bidData) && bidData.length >= 3) {
      setBiddingInfo({
        bidder: bidData[0] as string,
        amount: formatEther(bidData[1] as bigint),
        timestamp: Number(bidData[2] as bigint),
        isActive: bidData[0] !== '0x0000000000000000000000000000000000000000',
      })
    } else {
      setBiddingInfo(null)
    }
  }, [bidData])

  const handleStakeSuccess = () => {
    setStakeAmount('')
    // Staking info will be refetched automatically
  }

  const handleBidSuccess = () => {
    setBidAmount('')
    setSelectedWallet('')
    // Bid info will be refetched automatically via useReadContract
  }

  const MIN_STAKE = 10000 // 10,000 FLOW tokens

  return (
    <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6">
      <h2 className="text-2xl font-bold font-mono text-electric-cyan mb-6">
        $FLOW Token Utilities
      </h2>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 mb-6 border-b border-electric-cyan/20 overflow-x-auto scrollbar-hide">
        {[
          { id: 'staking', label: 'Staking', icon: Lock },
          { id: 'payment', label: 'Payment', icon: CreditCard },
          { id: 'bidding', label: 'Alert Bidding', icon: Zap },
          { id: 'governance', label: 'Governance', icon: Vote },
        ].map((tab) => {
          const IconComponent = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2 py-2 sm:px-4 sm:py-2 font-mono text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-electric-cyan border-b-2 border-electric-cyan'
                  : 'text-light-gray hover:text-electric-cyan/80'
              }`}
            >
              <IconComponent className="w-4 h-4 flex-shrink-0" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Staking Tab */}
      {activeTab === 'staking' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-electric-cyan mb-2">
              Data Curation Staking
            </h3>
            <p className="text-light-gray text-sm mb-4">
              Stake $FLOW tokens to become a Curator and tag/verify whale wallets. 
              Minimum stake: {MIN_STAKE.toLocaleString()} FLOW tokens.
            </p>
          </div>

          {stakingInfo && (
            <div className="bg-midnight-blue/30 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-light-gray/70 text-sm">Staked Amount</p>
                  <p className="text-electric-cyan font-mono text-lg">
                    {parseFloat(stakingInfo.stakedAmount).toLocaleString()} FLOW
                  </p>
                </div>
                <div>
                  <p className="text-light-gray/70 text-sm">Status</p>
                  <Badge variant={stakingInfo.isActive ? 'default' : 'secondary'}>
                    {stakingInfo.isActive ? 'Active Curator' : 'Not a Curator'}
                  </Badge>
                </div>
                <div>
                  <p className="text-light-gray/70 text-sm">Total Rewards</p>
                  <p className="text-electric-cyan font-mono text-lg">
                    {parseFloat(stakingInfo.totalRewards).toLocaleString()} FLOW
                  </p>
                </div>
                <div>
                  <p className="text-light-gray/70 text-sm">Slash Count</p>
                  <p className="text-light-gray font-mono text-lg">
                    {stakingInfo.slashCount}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isConnected && (
            <div className="bg-midnight-blue/30 rounded-lg p-4 mb-4">
              <p className="text-light-gray text-sm">
                Connect your wallet to stake FLOW tokens
              </p>
            </div>
          )}

          <div>
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

          {isConnected ? (
            <Tooltip.TooltipProvider>
              <Tooltip.Tooltip>
                <Tooltip.TooltipTrigger asChild>
                  <div>
                    <StakeTransaction
                      amount={stakeAmount}
                      minStake={MIN_STAKE}
                      onSuccess={handleStakeSuccess}
                    />
                  </div>
                </Tooltip.TooltipTrigger>
                <Tooltip.TooltipContent>
                  <p>
                    Staking FLOW tokens allows you to become a Curator and tag whale wallets. 
                    Inaccurate tags may result in slashing (5% of staked amount).
                  </p>
                </Tooltip.TooltipContent>
              </Tooltip.Tooltip>
            </Tooltip.TooltipProvider>
          ) : (
            <Button variant="default" className="w-full" disabled>
              Connect Wallet to Stake
            </Button>
          )}
        </div>
      )}

      {/* Payment Tab */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-electric-cyan mb-2">
              Pay with $FLOW
            </h3>
            <p className="text-light-gray text-sm mb-4">
              Pay for Premium subscriptions using $FLOW tokens and receive a 20% discount.
            </p>
          </div>

          <div className="bg-midnight-blue/30 rounded-lg p-4">
            <p className="text-light-gray mb-2">Current Subscription</p>
            <p className="text-electric-cyan font-mono">Free Plan</p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/pricing">Upgrade to Premium</a>
            </Button>
          </div>

          <div className="bg-electric-cyan/10 border border-electric-cyan/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-electric-cyan flex-shrink-0" />
              <p className="text-electric-cyan font-semibold">Benefits of Paying with FLOW</p>
            </div>
            <ul className="text-light-gray text-sm space-y-1">
              <li>• 20% discount on all subscriptions</li>
              <li>• Governance voting rights</li>
              <li>• Support token deflationary mechanism</li>
              <li>• Access to exclusive token holder features</li>
            </ul>
          </div>
        </div>
      )}

      {/* Bidding Tab */}
      {activeTab === 'bidding' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-electric-cyan mb-2">
              Whale Alert Bidding
            </h3>
            <p className="text-light-gray text-sm mb-4">
              Bid $FLOW tokens to boost a specific whale wallet to the top of the alert feed. 
              Highest bidder gets priority notifications.
            </p>
          </div>

          <div>
            <label className="block text-light-gray mb-2">Wallet Address</label>
            <input
              type="text"
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="w-full bg-midnight-blue border border-electric-cyan/30 rounded px-4 py-2 text-light-gray focus:outline-none focus:border-electric-cyan font-mono text-sm"
              placeholder="0x..."
            />
          </div>

          {biddingInfo && (
            <div className="bg-midnight-blue/30 rounded-lg p-4">
              <p className="text-light-gray/70 text-sm mb-1">Current Highest Bid</p>
              <p className="text-electric-cyan font-mono text-lg">
                {parseFloat(biddingInfo.amount).toLocaleString()} FLOW
              </p>
            </div>
          )}

          <div>
            <label className="block text-light-gray mb-2">Your Bid (FLOW)</label>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full bg-midnight-blue border border-electric-cyan/30 rounded px-4 py-2 text-light-gray focus:outline-none focus:border-electric-cyan font-mono"
              placeholder="Enter bid amount"
            />
            <p className="text-light-gray/70 text-xs mt-1">
              Note: Bidding fees are permanently burned, creating deflationary pressure.
            </p>
          </div>

          {isConnected ? (
            <BidTransaction
              whaleAddress={selectedWallet}
              amount={bidAmount}
              onSuccess={handleBidSuccess}
            />
          ) : (
            <Button variant="default" className="w-full" disabled>
              Connect Wallet to Bid
            </Button>
          )}
        </div>
      )}

      {/* Governance Tab */}
      {activeTab === 'governance' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-electric-cyan mb-2">
              Governance Voting
            </h3>
            <p className="text-light-gray text-sm mb-4">
              Vote on key platform decisions using your $FLOW tokens. 
              Voting power is proportional to your token holdings.
            </p>
          </div>

          <div className="space-y-4">
            {proposals.length > 0 ? (
              proposals.map((proposal) => {
                const totalVotes = Number(proposal.forVotes) + Number(proposal.againstVotes)
                const forPercentage = totalVotes > 0 
                  ? (Number(proposal.forVotes) / totalVotes) * 100 
                  : 0
                const isActive = proposal.state === 0 // Active state

                return (
                  <div
                    key={proposal.id}
                    className={`bg-midnight-blue/30 border border-electric-cyan/30 rounded-lg p-4 ${!isActive ? 'opacity-60' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-electric-cyan font-semibold mb-1">
                          {proposal.title}
                        </h4>
                        <p className="text-light-gray text-sm">
                          {proposal.description}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {isActive ? 'Active' : 'Ended'}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-light-gray mb-2">
                        <span>Yes: {forPercentage.toFixed(1)}%</span>
                        <span>No: {(100 - forPercentage).toFixed(1)}%</span>
                      </div>
                      <Progress value={forPercentage} className="mb-2" />
                      <p className="text-xs text-light-gray/70">
                        {isActive ? 'Voting in progress' : 'Voting ended'}
                      </p>
                    </div>
                    {isActive && isConnected && (
                      <div className="flex gap-2 mt-4">
                        <VoteTransaction
                          proposalId={proposal.id}
                          support={true}
                          onSuccess={() => {}}
                        />
                        <VoteTransaction
                          proposalId={proposal.id}
                          support={false}
                          onSuccess={() => {}}
                        />
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="bg-midnight-blue/30 border border-electric-cyan/30 rounded-lg p-4">
                <p className="text-light-gray text-sm">
                  {isConnected ? 'No active proposals' : 'Connect wallet to view proposals'}
                </p>
              </div>
            )}

            <div className="bg-midnight-blue/30 border border-electric-cyan/30 rounded-lg p-4 opacity-60">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-electric-cyan font-semibold mb-1">
                    Reduce Minimum Stake to 5,000 FLOW
                  </h4>
                  <p className="text-light-gray text-sm">
                    Lower the barrier to entry for new Curators?
                  </p>
                </div>
                <Badge variant="secondary">Ended</Badge>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-light-gray mb-2">
                  <span>Yes: 42%</span>
                  <span>No: 58%</span>
                </div>
                <Progress value={42} className="mb-2" />
                <p className="text-xs text-light-gray/70">Ended 2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

