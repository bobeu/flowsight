/**
 * API Access Page
 * 
 * Tier 1: Institutional API Access
 * For Hedge Funds, Prop Trading Desks, VCs
 * $5,000 - $20,000/month for real-time LSP Index Data Feed
 */

'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/Button'

interface APIPlan {
  name: string
  price: number
  description: string
  features: string[]
  rateLimit: string
  latency: string
}

const apiPlans: APIPlan[] = [
  {
    name: 'Starter',
    price: 5000,
    description: 'For small trading desks and funds',
    features: [
      'Real-time LSP Index Data Feed',
      'Whale Wallet transaction history',
      '10,000 API calls/month',
      'WebSocket support',
      'Email support',
      '99.5% uptime SLA',
    ],
    rateLimit: '10 req/sec',
    latency: '< 100ms',
  },
  {
    name: 'Professional',
    price: 10000,
    description: 'For mid-size hedge funds and prop desks',
    features: [
      'Everything in Starter',
      '50,000 API calls/month',
      'Priority WebSocket connections',
      'Custom data endpoints',
      'Dedicated support channel',
      '99.9% uptime SLA',
      'Historical data access',
    ],
    rateLimit: '50 req/sec',
    latency: '< 50ms',
  },
  {
    name: 'Enterprise',
    price: 20000,
    description: 'For large institutions requiring mission-critical data',
    features: [
      'Everything in Professional',
      'Unlimited API calls',
      'Dedicated infrastructure',
      'Custom integration support',
      '24/7 dedicated support',
      '99.99% uptime SLA',
      'Full historical data archive',
      'Custom ML model parameters',
      'White-label options',
    ],
    rateLimit: 'Unlimited',
    latency: '< 20ms',
  },
]

export default function APIAccessPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)

  const handleRequestAccess = (plan: APIPlan) => {
    setSelectedPlan(plan.name)
    setShowContactForm(true)
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 font-mono text-electric-cyan">
            Institutional API Access
          </h1>
          <p className="text-xl text-light-gray mb-6">
            Real-time LSP Index Data Feed for Mission-Critical Trading
          </p>
          <p className="text-sm text-light-gray/70 max-w-2xl mx-auto">
            Low-latency, high-frequency access to FlowSight's proprietary Liquidity Shock Prediction Index.
            Trusted by hedge funds, proprietary trading desks, and institutional investors.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-electric-cyan mb-2">&lt; 50ms</div>
            <p className="text-light-gray">Average Latency</p>
          </div>
          <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-electric-cyan mb-2">99.9%</div>
            <p className="text-light-gray">Uptime SLA</p>
          </div>
          <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-electric-cyan mb-2">24/7</div>
            <p className="text-light-gray">Support</p>
          </div>
        </div>

        {/* API Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {apiPlans.map((plan) => (
            <div
              key={plan.name}
              className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold font-mono text-electric-cyan mb-2">
                  {plan.name}
                </h3>
                <p className="text-light-gray/70 text-sm mb-4">
                  {plan.description}
                </p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-electric-cyan">
                    ${plan.price.toLocaleString()}
                  </span>
                  <span className="text-light-gray ml-2">/month</span>
                </div>
                <div className="flex justify-center gap-4 text-sm text-light-gray/70 mb-4">
                  <span>{plan.rateLimit}</span>
                  <span>•</span>
                  <span>{plan.latency}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-electric-cyan mr-2">✓</span>
                    <span className="text-light-gray text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleRequestAccess(plan)}
                variant="default"
                className="w-full"
              >
                Request Access
              </Button>
            </div>
          ))}
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-midnight-blue border border-electric-cyan/50 rounded-lg p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold font-mono text-electric-cyan mb-4">
                Request API Access - {selectedPlan}
              </h2>
              <p className="text-light-gray mb-6">
                Our team will contact you within 24 hours to discuss your institutional API needs.
              </p>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-light-gray mb-2">Company Name</label>
                  <input
                    type="text"
                    className="w-full bg-midnight-blue border border-electric-cyan/30 rounded px-4 py-2 text-light-gray focus:outline-none focus:border-electric-cyan"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label className="block text-light-gray mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full bg-midnight-blue border border-electric-cyan/30 rounded px-4 py-2 text-light-gray focus:outline-none focus:border-electric-cyan"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-light-gray mb-2">Use Case</label>
                  <textarea
                    className="w-full bg-midnight-blue border border-electric-cyan/30 rounded px-4 py-2 text-light-gray focus:outline-none focus:border-electric-cyan h-24"
                    placeholder="Describe your use case and requirements..."
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowContactForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    className="flex-1"
                  >
                    Submit Request
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* API Documentation Link */}
        <div className="text-center">
          <p className="text-light-gray mb-4">
            Already have API access?
          </p>
          <Button variant="outline" asChild>
            <a href="/api-docs" target="_blank">
              View API Documentation
            </a>
          </Button>
        </div>
      </div>

      <Footer />
    </main>
  )
}

