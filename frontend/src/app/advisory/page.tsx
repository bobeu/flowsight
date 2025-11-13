/**
 * Advisory/Consulting Page
 * 
 * Tier 3: Tokenomics Risk Audit Service
 * For New Token Projects and DAOs
 * High-margin B2B consulting service
 */

'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import * as Tooltip from '@/components/ui/Tooltip'

interface ServicePackage {
  name: string
  price: string
  description: string
  deliverables: string[]
  timeline: string
}

const servicePackages: ServicePackage[] = [
  {
    name: 'Basic Audit',
    price: 'Starting at $5,000',
    description: 'Essential tokenomics risk assessment for early-stage projects',
    deliverables: [
      'Concentration Risk Analysis',
      'Top 10 Wallet Holdings Report',
      'Initial Liquidity Assessment',
      'Basic Recommendations Report',
      '1-hour consultation call',
    ],
    timeline: '5-7 business days',
  },
  {
    name: 'Comprehensive Audit',
    price: 'Starting at $15,000',
    description: 'Full tokenomics analysis with detailed recommendations',
    deliverables: [
      'Everything in Basic Audit',
      'Deep Liquidity Depth Analysis',
      'Whale Movement Pattern Analysis',
      'Vesting Schedule Risk Assessment',
      'Market Manipulation Risk Score',
      'Detailed Action Plan',
      '3-hour consultation sessions',
      '30-day follow-up support',
    ],
    timeline: '10-14 business days',
  },
  {
    name: 'Enterprise Package',
    price: 'Custom Pricing',
    description: 'Complete tokenomics strategy and ongoing monitoring',
    deliverables: [
      'Everything in Comprehensive Audit',
      'Custom Tokenomics Design',
      'Ongoing Monitoring (3 months)',
      'Real-time Alert Integration',
      'Dedicated Account Manager',
      'Quarterly Review Sessions',
      'White-label Reporting',
    ],
    timeline: 'Custom timeline',
  },
]

export default function AdvisoryPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)

  const handleRequestQuote = (pkg: ServicePackage) => {
    setSelectedPackage(pkg.name)
    setShowContactForm(true)
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 font-mono text-electric-cyan">
            Tokenomics Risk Audit
          </h1>
          <p className="text-xl text-light-gray mb-6">
            Expert Analysis for Token Projects & DAOs
          </p>
          <p className="text-sm text-light-gray/70 max-w-2xl mx-auto">
            Leverage FlowSight's proprietary on-chain intelligence to audit your token's 
            concentration risk, liquidity setup, and vulnerability to market manipulation 
            before launch.
          </p>
        </div>

        {/* Why Choose FlowSight */}
        <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8 mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold font-mono text-electric-cyan mb-6">
            Why FlowSight Tokenomics Audit?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-electric-cyan mb-2">
                Proprietary Data Intelligence
              </h3>
              <p className="text-light-gray text-sm">
                Access to real-time on-chain analytics and whale tracking data that 
                competitors cannot replicate.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-electric-cyan mb-2">
                Industry Authority
              </h3>
              <p className="text-light-gray text-sm">
                Positioned as the leading authority on Tokenomics Risk Management 
                in the crypto space.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-electric-cyan mb-2">
                Actionable Insights
              </h3>
              <p className="text-light-gray text-sm">
                Not just data—get specific, actionable recommendations to improve 
                your token's health and investor confidence.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-electric-cyan mb-2">
                Pre-Launch Protection
              </h3>
              <p className="text-light-gray text-sm">
                Identify and mitigate risks before they become problems, protecting 
                your project's reputation and investor trust.
              </p>
            </div>
          </div>
        </div>

        {/* Service Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {servicePackages.map((pkg) => (
            <div
              key={pkg.name}
              className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold font-mono text-electric-cyan mb-2">
                  {pkg.name}
                </h3>
                <p className="text-light-gray/70 text-sm mb-4">
                  {pkg.description}
                </p>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-electric-cyan">
                    {pkg.price}
                  </span>
                </div>
                <Badge variant="secondary" className="mb-4">
                  {pkg.timeline}
                </Badge>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.deliverables.map((deliverable, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-electric-cyan mr-2">✓</span>
                    <span className="text-light-gray text-sm">{deliverable}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleRequestQuote(pkg)}
                variant="default"
                className="w-full"
              >
                Request Quote
              </Button>
            </div>
          ))}
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-midnight-blue border border-electric-cyan/50 rounded-lg p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold font-mono text-electric-cyan mb-4">
                Request Quote - {selectedPackage}
              </h2>
              <p className="text-light-gray mb-6">
                Our advisory team will contact you within 48 hours to discuss your project's needs.
              </p>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-light-gray mb-2">Project/DAO Name</label>
                  <input
                    type="text"
                    className="w-full bg-midnight-blue border border-electric-cyan/30 rounded px-4 py-2 text-light-gray focus:outline-none focus:border-electric-cyan"
                    placeholder="Your project name"
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
                  <label className="block text-light-gray mb-2">Token Contract Address (if applicable)</label>
                  <input
                    type="text"
                    className="w-full bg-midnight-blue border border-electric-cyan/30 rounded px-4 py-2 text-light-gray focus:outline-none focus:border-electric-cyan font-mono text-sm"
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <label className="block text-light-gray mb-2">Project Stage</label>
                  <select className="w-full bg-midnight-blue border border-electric-cyan/30 rounded px-4 py-2 text-light-gray focus:outline-none focus:border-electric-cyan">
                    <option>Pre-Launch</option>
                    <option>Post-Launch</option>
                    <option>Token Redesign</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-light-gray mb-2">Additional Requirements</label>
                  <textarea
                    className="w-full bg-midnight-blue border border-electric-cyan/30 rounded px-4 py-2 text-light-gray focus:outline-none focus:border-electric-cyan h-24"
                    placeholder="Tell us about your specific needs..."
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

        {/* Testimonials Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold font-mono text-electric-cyan mb-6 text-center">
            Trusted by Leading Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6">
              <p className="text-light-gray italic mb-4">
                "FlowSight's audit identified critical concentration risks we hadn't considered. 
                Their recommendations helped us restructure our tokenomics before launch, 
                significantly improving investor confidence."
              </p>
              <p className="text-electric-cyan font-semibold">— Project Lead, DeFi Protocol</p>
            </div>
            <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-6">
              <p className="text-light-gray italic mb-4">
                "The comprehensive analysis provided actionable insights that directly 
                improved our token's market performance. Worth every dollar."
              </p>
              <p className="text-electric-cyan font-semibold">— DAO Treasury Manager</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

