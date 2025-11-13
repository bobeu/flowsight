/**
 * $FLOW Token Page
 * 
 * Dedicated page for $FLOW token utilities and tokenomics
 * Displays:
 * - Tokenomics overview
 * - Staking interface
 * - Payment options
 * - Whale Alert Bidding
 * - Governance voting
 */

'use client'

import { useState } from 'react'
import { Lock, Coins, Vote, Zap } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FLOWTokenIntegration from '@/components/FLOWTokenIntegration'
import CuratorWalletTagging from '@/components/CuratorWalletTagging'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'

export default function FLOWTokenPage() {
  const [activeSection, setActiveSection] = useState<'overview' | 'utilities' | 'tokenomics'>('overview')

  // Tokenomics data (from PT.md)
  const tokenomics = {
    totalSupply: 1_000_000_000,
    distribution: {
      community: { percentage: 45, amount: 450_000_000, label: 'Community & Rewards' },
      team: { percentage: 15, amount: 150_000_000, label: 'Team & Advisors (1yr cliff, 3yr vesting)' },
      ecosystem: { percentage: 20, amount: 200_000_000, label: 'Ecosystem & Treasury' },
      sale: { percentage: 20, amount: 200_000_000, label: 'Private/Public Sale' },
    },
    deflationary: {
      apiFeeBurn: 20, // 20% of Tier 1 API revenue
      biddingBurn: 100, // 100% of Whale Alert Bidding fees
      totalBurned: 0, // Will be fetched from contract
    },
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 font-mono text-electric-cyan">
            $FLOW Token
          </h1>
          <p className="text-xl text-light-gray mb-6">
            The Utility Token Powering FlowSight's Decentralized Data Layer
          </p>
          <p className="text-sm text-light-gray/70 max-w-2xl mx-auto">
            $FLOW is not just a funding tool—it's the foundation of FlowSight's unique 
            decentralized data curation system, creating a self-correcting, high-accuracy 
            data layer that competitors cannot replicate.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-8 border-b border-electric-cyan/20 overflow-x-auto scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'utilities', label: 'Token Utilities' },
            { id: 'tokenomics', label: 'Tokenomics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3 py-2 sm:px-6 sm:py-3 font-mono text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                activeSection === tab.id
                  ? 'text-electric-cyan border-b-2 border-electric-cyan'
                  : 'text-light-gray hover:text-electric-cyan/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8">
              <h2 className="text-2xl font-bold font-mono text-electric-cyan mb-6">
                Why $FLOW Token?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Lock className="w-6 h-6 text-electric-cyan flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-electric-cyan">
                      Decentralized Data Curation
                    </h3>
                  </div>
                  <p className="text-light-gray text-sm">
                    Stake $FLOW to become a Curator and tag whale wallets. This creates 
                    a decentralized, verifiable data layer superior to proprietary systems.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Coins className="w-6 h-6 text-electric-cyan flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-electric-cyan">
                      Deflationary Mechanism
                    </h3>
                  </div>
                  <p className="text-light-gray text-sm">
                    API fees and bidding fees are used to burn $FLOW tokens, creating 
                    scarcity and long-term value for holders.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Vote className="w-6 h-6 text-electric-cyan flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-electric-cyan">
                      Governance Rights
                    </h3>
                  </div>
                  <p className="text-light-gray text-sm">
                    $FLOW holders vote on key platform decisions, ensuring the roadmap 
                    aligns with community value.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-6 h-6 text-electric-cyan flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-electric-cyan">
                      Premium Access
                    </h3>
                  </div>
                  <p className="text-light-gray text-sm">
                    Pay for Premium subscriptions with $FLOW and receive a 20% discount, 
                    creating perpetual buying pressure.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-electric-cyan mb-2 break-words overflow-wrap-anywhere">
                  {tokenomics.totalSupply.toLocaleString()}
                </div>
                <p className="text-light-gray text-sm">Total Supply</p>
              </div>
              <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-electric-cyan mb-2">
                  {tokenomics.deflationary.apiFeeBurn}%
                </div>
                <p className="text-light-gray text-sm">API Fee Burn</p>
              </div>
              <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-electric-cyan mb-2">
                  {tokenomics.deflationary.biddingBurn}%
                </div>
                <p className="text-light-gray text-sm">Bidding Burn</p>
              </div>
              <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-electric-cyan mb-2">
                  10,000
                </div>
                <p className="text-light-gray text-sm">Min Stake (FLOW)</p>
              </div>
            </div>
          </div>
        )}

        {/* Token Utilities Section */}
        {activeSection === 'utilities' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <FLOWTokenIntegration />
            <div className="mt-6">
              <CuratorWalletTagging />
            </div>
          </div>
        )}

        {/* Tokenomics Section */}
        {activeSection === 'tokenomics' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Distribution Chart */}
            <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8">
              <h2 className="text-2xl font-bold font-mono text-electric-cyan mb-6">
                Token Distribution
              </h2>
              <div className="space-y-4">
                {Object.entries(tokenomics.distribution).map(([key, data]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="text-electric-cyan font-semibold">{data.label}</p>
                        <p className="text-light-gray/70 text-sm">
                          {data.amount.toLocaleString()} FLOW ({data.percentage}%)
                        </p>
                      </div>
                      <Badge variant="secondary">{data.percentage}%</Badge>
                    </div>
                    <Progress value={data.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Deflationary Mechanism */}
            <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8">
              <h2 className="text-2xl font-bold font-mono text-electric-cyan mb-6">
                Deflationary Mechanism
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-electric-cyan mb-2">
                    API Fee Burn (20%)
                  </h3>
                  <p className="text-light-gray text-sm mb-2">
                    20% of all Tier 1 Institutional API revenue (paid in USD/Stablecoins) 
                    is used to market-buy and permanently burn $FLOW tokens.
                  </p>
                  <div className="bg-midnight-blue/30 rounded p-3">
                    <p className="text-light-gray/70 text-xs">
                      This creates deflationary pressure tied directly to business growth.
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-electric-cyan mb-2">
                    Bidding Burn (100%)
                  </h3>
                  <p className="text-light-gray text-sm mb-2">
                    100% of Whale Alert Bidding fees (paid in $FLOW) are permanently burned.
                  </p>
                  <div className="bg-midnight-blue/30 rounded p-3">
                    <p className="text-light-gray/70 text-xs">
                      Every bid creates immediate scarcity, rewarding long-term holders.
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-electric-cyan mb-2">
                    Slashing Mechanism (5%)
                  </h3>
                  <p className="text-light-gray text-sm mb-2">
                    Curators who provide false or malicious tags have 5% of their staked 
                    $FLOW slashed and burned, ensuring data integrity.
                  </p>
                  <div className="bg-midnight-blue/30 rounded p-3">
                    <p className="text-light-gray/70 text-xs">
                      This creates a self-correcting system that improves data quality over time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Utility Summary */}
            <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8">
              <h2 className="text-2xl font-bold font-mono text-electric-cyan mb-6">
                Token Utility Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-electric-cyan mb-3">
                    Use Cases
                  </h3>
                  <ul className="space-y-2 text-light-gray text-sm">
                    <li>• Data Curation Staking (10,000 FLOW minimum)</li>
                    <li>• Premium Subscription Payment (20% discount)</li>
                    <li>• Whale Alert Bidding (Priority notifications)</li>
                    <li>• Governance Voting (Platform decisions)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-electric-cyan mb-3">
                    Value Drivers
                  </h3>
                  <ul className="space-y-2 text-light-gray text-sm">
                    <li>• Deflationary burn mechanisms</li>
                    <li>• Staking reduces circulating supply</li>
                    <li>• Revenue-linked rewards for Curators</li>
                    <li>• Growing platform adoption</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}

