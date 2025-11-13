/**
 * Homepage Component
 * 
 * Main landing page displaying:
 * - Global LSP Index gauge
 * - Price charts
 * - Quick stats
 * - Animated visualizations
 * - Disclaimer dialog (pops up automatically)
 */

import LSPGauge from '@/components/LSPGauge'
import PriceChart from '@/components/PriceChart'
import QuickStats from '@/components/QuickStats'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DisclaimerDialog from '@/components/DisclaimerDialog'
import AnimatedFlowBackground from '@/components/AnimatedFlowBackground'
import MiniLSPChart from '@/components/MiniLSPChart'
import LiveDataStream from '@/components/LiveDataStream'
import AnimatedMetric from '@/components/AnimatedMetric'

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <Header />
      
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <AnimatedFlowBackground />
      </div>
      
      <div className="container mx-auto px-4 py-8 relative" style={{ zIndex: 1 }}>
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16 relative">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 font-mono leading-tight">
              <span className="text-electric-cyan">The Oracle of Flow</span>
            </h1>
            <div className="relative">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-light-gray font-light leading-relaxed">
                Predicting Crypto Liquidity Shocks
              </p>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-electric-cyan to-transparent"></div>
            </div>
            <p className="mt-6 md:mt-8 text-sm sm:text-base md:text-lg text-light-gray/70 max-w-2xl mx-auto leading-relaxed">
              Real-time on-chain analytics and predictive intelligence for institutional-grade 
              liquidity risk assessment
            </p>
          </div>
        </div>

        {/* Animated Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-4 text-center backdrop-blur-sm">
            <AnimatedMetric
              value={1.24}
              suffix="B"
              prefix="$"
              duration={2000}
              decimals={2}
              className="text-2xl md:text-3xl font-bold text-electric-cyan font-mono"
            />
            <p className="text-xs text-light-gray/70 mt-1">Market Size</p>
          </div>
          <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-4 text-center backdrop-blur-sm">
            <AnimatedMetric
              value={22.6}
              suffix="%"
              duration={2000}
              decimals={1}
              className="text-2xl md:text-3xl font-bold text-electric-cyan font-mono"
            />
            <p className="text-xs text-light-gray/70 mt-1">CAGR</p>
          </div>
          <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-4 text-center backdrop-blur-sm">
            <AnimatedMetric
              value={7.98}
              suffix="B"
              prefix="$"
              duration={2000}
              decimals={2}
              className="text-2xl md:text-3xl font-bold text-electric-cyan font-mono"
            />
            <p className="text-xs text-light-gray/70 mt-1">By 2033</p>
          </div>
          <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-4 text-center backdrop-blur-sm">
            <AnimatedMetric
              value={99.9}
              suffix="%"
              duration={2000}
              decimals={1}
              className="text-2xl md:text-3xl font-bold text-electric-cyan font-mono"
            />
            <p className="text-xs text-light-gray/70 mt-1">Uptime SLA</p>
          </div>
        </div>

        {/* LSP Index Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-electric-cyan font-mono">
            Global LSP Index
          </h2>
          <div className="flex justify-center">
            <LSPGauge asset="BTC" />
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats />

        {/* Live Data Visualization Section */}
        <div className="mt-12 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-electric-cyan font-mono">
            Real-Time Monitoring
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MiniLSPChart />
            <LiveDataStream />
          </div>
        </div>

        {/* Price Charts */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-electric-cyan font-mono">
            Price Charts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PriceChart asset="BTC" />
            <PriceChart asset="ETH" />
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Disclaimer Dialog - Pops up automatically */}
      <DisclaimerDialog />
    </main>
  )
}

