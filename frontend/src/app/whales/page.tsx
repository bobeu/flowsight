/**
 * Whale Tracker Page
 * 
 * Displays:
 * - Top 10 whale wallets
 * - Real-time alert feed
 * - Whale wallet details
 * 
 * Protected: Requires disclaimer acceptance
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import WhaleTable from '@/components/WhaleTable'
import WhaleAlerts from '@/components/WhaleAlerts'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { isDisclaimerAccepted } from '@/components/DisclaimerDialog'
import DisclaimerDialog from '@/components/DisclaimerDialog'

export default function WhalesPage() {
  const router = useRouter()
  const [isAccepted, setIsAccepted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if disclaimer is accepted
    const accepted = isDisclaimerAccepted()
    setIsAccepted(accepted)
    setLoading(false)

    // If not accepted, redirect to homepage
    if (!accepted) {
      router.push('/')
    }
  }, [router])

  // Show loading state while checking
  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-light-gray">Loading...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  // If not accepted, show disclaimer dialog and redirect
  if (!isAccepted) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="text-2xl font-bold mb-4 font-mono text-electric-cyan">
              Disclaimer Required
            </h1>
            <p className="text-light-gray mb-4">
              You must accept the disclaimer to access the Whale Tracker Dashboard.
            </p>
            <p className="text-light-gray/70 text-sm">
              Redirecting to homepage...
            </p>
          </div>
        </div>
        <Footer />
        <DisclaimerDialog />
      </main>
    )
  }

  // Show whale dashboard if accepted
  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 font-mono text-electric-cyan">
          Whale Tracker Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Whale Table */}
          <div>
            <h2 className="text-2xl font-bold mb-4 font-mono text-electric-cyan">
              Top Whale Wallets
            </h2>
            <WhaleTable />
          </div>

          {/* Real-time Alerts */}
          <div>
            <h2 className="text-2xl font-bold mb-4 font-mono text-electric-cyan">
              Real-Time Alert Feed
            </h2>
            <WhaleAlerts />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

