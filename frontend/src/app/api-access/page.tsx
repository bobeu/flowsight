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
  const [activeTab, setActiveTab] = useState<'plans' | 'docs'>('plans')

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

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8 border-b border-electric-cyan/30 max-w-4xl mx-auto">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-6 py-3 font-mono font-semibold transition-colors ${
              activeTab === 'plans'
                ? 'text-electric-cyan border-b-2 border-electric-cyan'
                : 'text-light-gray/70 hover:text-electric-cyan'
            }`}
          >
            API Plans
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-6 py-3 font-mono font-semibold transition-colors ${
              activeTab === 'docs'
                ? 'text-electric-cyan border-b-2 border-electric-cyan'
                : 'text-light-gray/70 hover:text-electric-cyan'
            }`}
          >
            API Documentation
          </button>
        </div>

        {/* API Plans Tab */}
        {activeTab === 'plans' && (
          <>
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

          </>
        )}

        {/* API Documentation Tab */}
        {activeTab === 'docs' && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Authentication */}
            <section className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8">
              <h2 className="text-3xl font-bold font-mono text-electric-cyan mb-4">Authentication</h2>
              <p className="text-light-gray mb-4">
                All API requests require authentication using an API key. Include your API key in the request header:
              </p>
              <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto">
                <code>Authorization: Bearer YOUR_API_KEY</code>
              </div>
            </section>

            {/* Base URL */}
            <section className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8">
              <h2 className="text-3xl font-bold font-mono text-electric-cyan mb-4">Base URL</h2>
              <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto">
                <code>https://api.flowsight.io/api/v1</code>
              </div>
            </section>

            {/* LSP Index Endpoints */}
            <section className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8">
              <h2 className="text-3xl font-bold font-mono text-electric-cyan mb-4">LSP Index Endpoints</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-mono text-electric-cyan mb-2">GET /lsp/current</h3>
                <p className="text-light-gray mb-3">Get the current LSP score for an asset</p>
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto mb-3">
                  <code>GET /api/v1/lsp/current?asset=BTC</code>
                </div>
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4">
                  <pre className="text-sm text-light-gray font-mono overflow-x-auto">{`{
  "asset": "BTC",
  "score": 2.5,
  "timestamp": "2025-01-15T10:30:00Z",
  "interpretation": "Moderate Risk - Some downward pressure possible"
}`}</pre>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-mono text-electric-cyan mb-2">GET /lsp/history</h3>
                <p className="text-light-gray mb-3">Get historical LSP scores for an asset</p>
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto mb-3">
                  <code>GET /api/v1/lsp/history?asset=BTC&hours=24</code>
                </div>
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4">
                  <pre className="text-sm text-light-gray font-mono overflow-x-auto">{`{
                    "asset": "BTC",
                    "data": [
                      {
                        "score": 2.5,
                        "timestamp": "2025-01-15T10:30:00Z"
                      }
                    ],
                    "count": 24
                  }`}
                  </pre>
                </div>
              </div>
            </section>

            {/* Whale Endpoints */}
            <section className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8">
              <h2 className="text-3xl font-bold font-mono text-electric-cyan mb-4">Whale Tracker Endpoints</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-mono text-electric-cyan mb-2">GET /whales/top</h3>
                <p className="text-light-gray mb-3">Get top whale wallets by holdings</p>
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto mb-3">
                  <code>GET /api/v1/whales/top?limit=10</code>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-mono text-electric-cyan mb-2">GET /whales/{'{address}'}</h3>
                <p className="text-light-gray mb-3">Get detailed information about a specific whale wallet</p>
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto mb-3">
                  <code>GET /api/v1/whales/0x1234...</code>
                </div>
              </div>
            </section>

            {/* Transaction Endpoints */}
            <section className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8">
              <h2 className="text-3xl font-bold font-mono text-electric-cyan mb-4">Transaction Endpoints</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-mono text-electric-cyan mb-2">GET /transactions/recent</h3>
                <p className="text-light-gray mb-3">Get recent large transactions</p>
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto mb-3">
                  <code>GET /api/v1/transactions/recent?limit=50&min_amount=1000000</code>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-mono text-electric-cyan mb-2">GET /transactions/alerts</h3>
                <p className="text-light-gray mb-3">Get whale alert feed - large transactions within specified time window</p>
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto mb-3">
                  <code>GET /api/v1/transactions/alerts?hours=24&min_amount=1000000</code>
                </div>
              </div>
            </section>

            {/* WebSocket */}
            <section className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8">
              <h2 className="text-3xl font-bold font-mono text-electric-cyan mb-4">WebSocket API</h2>
              <p className="text-light-gray mb-4">
                Real-time data streaming via WebSocket connections. Available rooms:
              </p>
              <ul className="list-disc list-inside text-light-gray space-y-2 mb-4">
                <li><code className="text-electric-cyan">lsp_updates</code> - Real-time LSP Index updates</li>
                <li><code className="text-electric-cyan">whale_alerts</code> - Whale transaction alerts</li>
                <li><code className="text-electric-cyan">transactions</code> - Large transaction feed</li>
              </ul>
              <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto">
                <code>wss://api.flowsight.io/api/v1/ws/{'{room}'}</code>
              </div>
            </section>

            {/* Rate Limits */}
            <section className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8">
              <h2 className="text-3xl font-bold font-mono text-electric-cyan mb-4">Rate Limits</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-mono text-electric-cyan mb-2">Starter Plan</h3>
                  <p className="text-light-gray">10 requests/second, 10,000 calls/month</p>
                </div>
                <div>
                  <h3 className="text-lg font-mono text-electric-cyan mb-2">Professional Plan</h3>
                  <p className="text-light-gray">50 requests/second, 50,000 calls/month</p>
                </div>
                <div>
                  <h3 className="text-lg font-mono text-electric-cyan mb-2">Enterprise Plan</h3>
                  <p className="text-light-gray">Unlimited requests/second, unlimited calls/month</p>
                </div>
              </div>
            </section>

            {/* Code Examples */}
            <section className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8">
              <h2 className="text-3xl font-bold font-mono text-electric-cyan mb-4">Code Examples</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-mono text-electric-cyan mb-2">Python</h3>
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4">
                  <pre className="text-sm text-light-gray font-mono overflow-x-auto">{`import requests

headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}

response = requests.get(
    "https://api.flowsight.io/api/v1/lsp/current",
    params={"asset": "BTC"},
    headers=headers
)

data = response.json()
print(data)`}</pre>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-mono text-electric-cyan mb-2">JavaScript</h3>
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4">
                  <pre className="text-sm text-light-gray font-mono overflow-x-auto">{`const response = await fetch(
  'https://api.flowsight.io/api/v1/lsp/current?asset=BTC',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  }
);

const data = await response.json();
console.log(data);`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-mono text-electric-cyan mb-2">cURL</h3>
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4">
                  <pre className="text-sm text-light-gray font-mono overflow-x-auto">{`curl -X GET \\
  "https://api.flowsight.io/api/v1/lsp/current?asset=BTC" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* API Documentation Link */}
        <div className="text-center mt-12">
          <p className="text-light-gray mb-4">
            Already have API access?
          </p>
          <Button variant="outline" asChild>
            <a href="/api-docs">
              View Interactive API Docs
            </a>
          </Button>
        </div>
      </div>

      <Footer />
    </main>
  )
}

