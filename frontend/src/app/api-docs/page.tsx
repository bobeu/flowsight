/**
 * Interactive API Documentation Page
 * 
 * Comprehensive API documentation with plans, endpoints, and examples
 * Aligned with FlowSight's institutional API access model
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
  monthlyCalls: string
}

const apiPlans: APIPlan[] = [
  {
    name: 'Starter',
    price: 5000,
    description: 'For small trading desks and funds',
    features: [
      'Real-time LSP Index Data Feed',
      'Whale Wallet transaction history',
      'WebSocket support',
      'Email support',
      '99.5% uptime SLA',
    ],
    rateLimit: '10 req/sec',
    latency: '< 100ms',
    monthlyCalls: '10,000',
  },
  {
    name: 'Professional',
    price: 10000,
    description: 'For mid-size hedge funds and prop desks',
    features: [
      'Everything in Starter',
      'Priority WebSocket connections',
      'Custom data endpoints',
      'Dedicated support channel',
      '99.9% uptime SLA',
      'Historical data access',
    ],
    rateLimit: '50 req/sec',
    latency: '< 50ms',
    monthlyCalls: '50,000',
  },
  {
    name: 'Enterprise',
    price: 20000,
    description: 'For large institutions requiring mission-critical data',
    features: [
      'Everything in Professional',
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
    monthlyCalls: 'Unlimited',
  },
]

export default function APIDocsPage() {
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
            FlowSight API Documentation
          </h1>
          <p className="text-xl text-light-gray mb-6">
            Complete API Reference for Institutional Access
          </p>
          <p className="text-sm text-light-gray/70 max-w-2xl mx-auto">
            Access real-time LSP Index data, whale tracking, and transaction alerts through our 
            high-performance REST API and WebSocket streams.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6 mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold font-mono text-electric-cyan mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="#authentication" className="text-light-gray hover:text-electric-cyan transition-colors text-sm">
              Authentication
            </a>
            <a href="#lsp-endpoints" className="text-light-gray hover:text-electric-cyan transition-colors text-sm">
              LSP Index
            </a>
            <a href="#whale-endpoints" className="text-light-gray hover:text-electric-cyan transition-colors text-sm">
              Whale Tracker
            </a>
            <a href="#transaction-endpoints" className="text-light-gray hover:text-electric-cyan transition-colors text-sm">
              Transactions
            </a>
            <a href="#websocket" className="text-light-gray hover:text-electric-cyan transition-colors text-sm">
              WebSocket
            </a>
            <a href="#plans" className="text-light-gray hover:text-electric-cyan transition-colors text-sm">
              API Plans
            </a>
            <a href="#code-examples" className="text-light-gray hover:text-electric-cyan transition-colors text-sm">
              Code Examples
            </a>
            <a href="#rate-limits" className="text-light-gray hover:text-electric-cyan transition-colors text-sm">
              Rate Limits
            </a>
          </div>
        </div>

        {/* API Plans Section */}
        <section id="plans" className="mb-16">
          <h2 className="text-4xl font-bold font-mono text-electric-cyan mb-8 text-center">
            Institutional API Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {apiPlans.map((plan) => (
              <div
                key={plan.name}
                className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8 hover:border-electric-cyan/60 transition-colors"
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
                    <span>•</span>
                    <span>{plan.monthlyCalls} calls</span>
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
        </section>

        {/* Authentication Section */}
        <section id="authentication" className="mb-16">
          <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-mono text-electric-cyan mb-4">Authentication</h2>
            <p className="text-light-gray mb-6">
              All API requests require authentication using an API key. After subscribing to an API plan, 
              you'll receive a unique API key. Include this key in the <code className="text-electric-cyan">Authorization</code> header 
              for all requests.
            </p>
            
            <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto mb-4">
              <code>Authorization: Bearer YOUR_API_KEY</code>
            </div>

            <div className="bg-midnight-blue/70 border border-electric-cyan/20 rounded p-4">
              <p className="text-light-gray text-sm mb-2">
                <strong className="text-electric-cyan">Security Note:</strong> Never expose your API key in client-side code or 
                public repositories. Store it securely and use environment variables in production.
              </p>
            </div>
          </div>
        </section>

        {/* Base URL */}
        <section className="mb-16">
          <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-mono text-electric-cyan mb-4">Base URL</h2>
            <p className="text-light-gray mb-4">All API endpoints are accessed via the following base URL:</p>
            <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto">
              <code>https://api.flowsight.io/api/v1</code>
            </div>
            <p className="text-light-gray/70 text-sm mt-4">
              For local development, use: <code className="text-electric-cyan">http://localhost:8000/api/v1</code>
            </p>
          </div>
        </section>

        {/* LSP Index Endpoints */}
        <section id="lsp-endpoints" className="mb-16">
          <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-mono text-electric-cyan mb-6">LSP Index Endpoints</h2>
            <p className="text-light-gray mb-6">
              The Liquidity Shock Prediction (LSP) Index is FlowSight's proprietary metric that predicts 
              near-term volatility risk for crypto assets. Scores range from -10 to +10.
            </p>
            
            <div className="space-y-8">
              <div className="border-b border-electric-cyan/20 pb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-mono text-electric-cyan">GET /lsp/current</h3>
                  <span className="px-3 py-1 bg-electric-cyan/20 text-electric-cyan text-xs font-mono rounded">
                    GET
                  </span>
                </div>
                <p className="text-light-gray mb-3">Get the current LSP score for an asset</p>
                
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto mb-3">
                  <code>GET /api/v1/lsp/current?asset=BTC</code>
                </div>

                <div className="mb-3">
                  <p className="text-light-gray text-sm mb-2"><strong>Query Parameters:</strong></p>
                  <ul className="list-disc list-inside text-light-gray/80 text-sm space-y-1 ml-4">
                    <li><code className="text-electric-cyan">asset</code> (required): Asset symbol (BTC, ETH, BNB)</li>
                  </ul>
                </div>

                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4">
                  <p className="text-light-gray text-sm mb-2"><strong>Response:</strong></p>
                  <pre className="text-sm text-light-gray font-mono overflow-x-auto whitespace-pre-wrap">{`{
  "asset": "BTC",
  "score": 2.5,
  "timestamp": "2025-01-15T10:30:00Z",
  "interpretation": "Moderate Risk - Some downward pressure possible"
}`}</pre>
                </div>

                <div className="mt-3 bg-midnight-blue/70 border border-electric-cyan/20 rounded p-3">
                  <p className="text-light-gray text-xs">
                    <strong className="text-electric-cyan">Score Interpretation:</strong> 
                    {' '}≥7: High Risk | ≥3: Moderate Risk | -3 to 3: Neutral | ≤-3: Low Risk | ≤-7: Very Low Risk
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-mono text-electric-cyan">GET /lsp/history</h3>
                  <span className="px-3 py-1 bg-electric-cyan/20 text-electric-cyan text-xs font-mono rounded">
                    GET
                  </span>
                </div>
                <p className="text-light-gray mb-3">Get historical LSP scores for an asset</p>
                
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto mb-3">
                  <code>GET /api/v1/lsp/history?asset=BTC&hours=24</code>
                </div>

                <div className="mb-3">
                  <p className="text-light-gray text-sm mb-2"><strong>Query Parameters:</strong></p>
                  <ul className="list-disc list-inside text-light-gray/80 text-sm space-y-1 ml-4">
                    <li><code className="text-electric-cyan">asset</code> (required): Asset symbol</li>
                    <li><code className="text-electric-cyan">hours</code> (optional, default: 24): Number of hours of history</li>
                  </ul>
                </div>

                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4">
                  <p className="text-light-gray text-sm mb-2"><strong>Response:</strong></p>
                  <pre className="text-sm text-light-gray font-mono overflow-x-auto whitespace-pre-wrap">{`{
  "asset": "BTC",
  "data": [
    {
      "score": 2.5,
      "timestamp": "2025-01-15T10:30:00Z"
    }
  ],
  "count": 24
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Whale Endpoints */}
        <section id="whale-endpoints" className="mb-16">
          <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-mono text-electric-cyan mb-6">Whale Tracker Endpoints</h2>
            <p className="text-light-gray mb-6">
              Track large wallet holders and monitor their transaction patterns to identify potential market movements.
            </p>
            
            <div className="space-y-8">
              <div className="border-b border-electric-cyan/20 pb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-mono text-electric-cyan">GET /whales/top</h3>
                  <span className="px-3 py-1 bg-electric-cyan/20 text-electric-cyan text-xs font-mono rounded">
                    GET
                  </span>
                </div>
                <p className="text-light-gray mb-3">Get top whale wallets by holdings</p>
                
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto mb-3">
                  <code>GET /api/v1/whales/top?limit=10</code>
                </div>

                <div className="mb-3">
                  <p className="text-light-gray text-sm mb-2"><strong>Query Parameters:</strong></p>
                  <ul className="list-disc list-inside text-light-gray/80 text-sm space-y-1 ml-4">
                    <li><code className="text-electric-cyan">limit</code> (optional, default: 10, max: 100): Number of whales to return</li>
                  </ul>
                </div>

                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4">
                  <p className="text-light-gray text-sm mb-2"><strong>Response:</strong></p>
                  <pre className="text-sm text-light-gray font-mono overflow-x-auto whitespace-pre-wrap">{`{
  "count": 10,
  "whales": [
    {
      "address": "0x1234...",
      "label": "Institutional Wallet",
      "total_holdings_usd": 50000000.0,
      "is_exchange": false,
      "curator_address": "0x5678..."
    }
  ]
}`}</pre>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-mono text-electric-cyan">GET /whales/{'{address}'}</h3>
                  <span className="px-3 py-1 bg-electric-cyan/20 text-electric-cyan text-xs font-mono rounded">
                    GET
                  </span>
                </div>
                <p className="text-light-gray mb-3">Get detailed information about a specific whale wallet</p>
                
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto mb-3">
                  <code>GET /api/v1/whales/0x1234567890abcdef1234567890abcdef12345678</code>
                </div>

                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4">
                  <p className="text-light-gray text-sm mb-2"><strong>Response:</strong></p>
                  <pre className="text-sm text-light-gray font-mono overflow-x-auto whitespace-pre-wrap">{`{
  "address": "0x1234...",
  "label": "Institutional Wallet",
  "total_holdings_usd": 50000000.0,
  "is_exchange": false,
  "curator_address": "0x5678...",
  "recent_transactions": [
    {
      "tx_hash": "0xabcd...",
      "from_address": "0x1234...",
      "to_address": "0x5678...",
      "amount_usd": 1000000.0,
      "token_symbol": "ETH",
      "timestamp": "2025-01-15T10:30:00Z"
    }
  ]
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transaction Endpoints */}
        <section id="transaction-endpoints" className="mb-16">
          <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-mono text-electric-cyan mb-6">Transaction Endpoints</h2>
            <p className="text-light-gray mb-6">
              Monitor large transactions and receive alerts for significant whale movements that may impact market liquidity.
            </p>
            
            <div className="space-y-8">
              <div className="border-b border-electric-cyan/20 pb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-mono text-electric-cyan">GET /transactions/recent</h3>
                  <span className="px-3 py-1 bg-electric-cyan/20 text-electric-cyan text-xs font-mono rounded">
                    GET
                  </span>
                </div>
                <p className="text-light-gray mb-3">Get recent large transactions</p>
                
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto mb-3">
                  <code>GET /api/v1/transactions/recent?limit=50&min_amount=1000000&asset=ETH</code>
                </div>

                <div className="mb-3">
                  <p className="text-light-gray text-sm mb-2"><strong>Query Parameters:</strong></p>
                  <ul className="list-disc list-inside text-light-gray/80 text-sm space-y-1 ml-4">
                    <li><code className="text-electric-cyan">limit</code> (optional, default: 50, max: 500): Number of transactions</li>
                    <li><code className="text-electric-cyan">min_amount</code> (optional): Minimum transaction amount in USD</li>
                    <li><code className="text-electric-cyan">asset</code> (optional): Filter by asset symbol</li>
                  </ul>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-mono text-electric-cyan">GET /transactions/alerts</h3>
                  <span className="px-3 py-1 bg-electric-cyan/20 text-electric-cyan text-xs font-mono rounded">
                    GET
                  </span>
                </div>
                <p className="text-light-gray mb-3">Get whale alert feed - large transactions within specified time window</p>
                
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto mb-3">
                  <code>GET /api/v1/transactions/alerts?hours=24&min_amount=1000000</code>
                </div>

                <div className="mb-3">
                  <p className="text-light-gray text-sm mb-2"><strong>Query Parameters:</strong></p>
                  <ul className="list-disc list-inside text-light-gray/80 text-sm space-y-1 ml-4">
                    <li><code className="text-electric-cyan">hours</code> (optional, default: 24): Number of hours to look back</li>
                    <li><code className="text-electric-cyan">min_amount</code> (optional, default: 1,000,000): Minimum amount in USD</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WebSocket */}
        <section id="websocket" className="mb-16">
          <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-mono text-electric-cyan mb-4">WebSocket API</h2>
            <p className="text-light-gray mb-6">
              Real-time data streaming via WebSocket connections. Connect to receive live updates without polling.
            </p>
            
            <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4 font-mono text-sm text-light-gray overflow-x-auto mb-6">
              <code>wss://api.flowsight.io/api/v1/ws/{'{room}'}</code>
            </div>

            <div className="mb-6">
              <p className="text-light-gray mb-3"><strong>Available Rooms:</strong></p>
              <ul className="space-y-3">
                <li className="bg-midnight-blue/70 border border-electric-cyan/20 rounded p-4">
                  <code className="text-electric-cyan">lsp_updates</code>
                  <p className="text-light-gray text-sm mt-2">Real-time LSP Index updates for all tracked assets</p>
                </li>
                <li className="bg-midnight-blue/70 border border-electric-cyan/20 rounded p-4">
                  <code className="text-electric-cyan">whale_alerts</code>
                  <p className="text-light-gray text-sm mt-2">Instant notifications for large whale transactions</p>
                </li>
                <li className="bg-midnight-blue/70 border border-electric-cyan/20 rounded p-4">
                  <code className="text-electric-cyan">transactions</code>
                  <p className="text-light-gray text-sm mt-2">Live feed of all large transactions above threshold</p>
                </li>
              </ul>
            </div>

            <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4">
              <p className="text-light-gray text-sm mb-2"><strong>Example WebSocket Connection (JavaScript):</strong></p>
              <pre className="text-sm text-light-gray font-mono overflow-x-auto whitespace-pre-wrap">{`const ws = new WebSocket('wss://api.flowsight.io/api/v1/ws/lsp_updates');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('LSP Update:', data);
};`}</pre>
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section id="rate-limits" className="mb-16">
          <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-mono text-electric-cyan mb-6">Rate Limits</h2>
            <p className="text-light-gray mb-6">
              Rate limits are enforced per API key to ensure fair usage and system stability. 
              Exceeding limits will result in HTTP 429 (Too Many Requests) responses.
            </p>
            
            <div className="space-y-4">
              {apiPlans.map((plan) => (
                <div key={plan.name} className="bg-midnight-blue/70 border border-electric-cyan/20 rounded p-6">
                  <h3 className="text-lg font-mono text-electric-cyan mb-3">{plan.name} Plan</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-light-gray">
                    <div>
                      <strong className="text-electric-cyan">Rate Limit:</strong> {plan.rateLimit}
                    </div>
                    <div>
                      <strong className="text-electric-cyan">Monthly Calls:</strong> {plan.monthlyCalls}
                    </div>
                    <div>
                      <strong className="text-electric-cyan">Latency:</strong> {plan.latency}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-midnight-blue/70 border border-electric-cyan/20 rounded p-4">
              <p className="text-light-gray text-sm">
                <strong className="text-electric-cyan">Rate Limit Headers:</strong> All responses include 
                <code className="text-electric-cyan"> X-RateLimit-Remaining</code> and 
                <code className="text-electric-cyan"> X-RateLimit-Reset</code> headers to help you manage your usage.
              </p>
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section id="code-examples" className="mb-16">
          <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold font-mono text-electric-cyan mb-6">Code Examples</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-mono text-electric-cyan mb-3">Python</h3>
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4">
                  <pre className="text-sm text-light-gray font-mono overflow-x-auto whitespace-pre-wrap">{`import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://api.flowsight.io/api/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}"
}

# Get current LSP score
response = requests.get(
    f"{BASE_URL}/lsp/current",
    params={"asset": "BTC"},
    headers=headers
)

data = response.json()
print(f"BTC LSP Score: {data['score']}")
print(f"Interpretation: {data['interpretation']}")`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-mono text-electric-cyan mb-3">JavaScript/TypeScript</h3>
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4">
                  <pre className="text-sm text-light-gray font-mono overflow-x-auto whitespace-pre-wrap">{`const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://api.flowsight.io/api/v1';

async function getCurrentLSP(asset: string) {
  const response = await fetch(
    \`\${BASE_URL}/lsp/current?asset=\${asset}\`,
    {
      headers: {
        'Authorization': \`Bearer \${API_KEY}\`
      }
    }
  );

  const data = await response.json();
  console.log(\`\${asset} LSP Score:\`, data.score);
  return data;
}

// Usage
getCurrentLSP('BTC');`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-mono text-electric-cyan mb-3">cURL</h3>
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4">
                  <pre className="text-sm text-light-gray font-mono overflow-x-auto whitespace-pre-wrap">{`curl -X GET \\
  "https://api.flowsight.io/api/v1/lsp/current?asset=BTC" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-mono text-electric-cyan mb-3">WebSocket (JavaScript)</h3>
                <div className="bg-midnight-blue border border-electric-cyan/20 rounded p-4">
                  <pre className="text-sm text-light-gray font-mono overflow-x-auto whitespace-pre-wrap">{`const API_KEY = 'YOUR_API_KEY';
const ws = new WebSocket(
  \`wss://api.flowsight.io/api/v1/ws/lsp_updates?token=\${API_KEY}\`
);

ws.onopen = () => {
  console.log('Connected to FlowSight WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('LSP Update:', data);
  // Handle real-time LSP score updates
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};`}</pre>
                </div>
              </div>
            </div>
          </div>
        </section>

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
      </div>

      <Footer />
    </main>
  )
}

