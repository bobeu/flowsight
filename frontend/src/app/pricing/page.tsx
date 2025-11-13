/**
 * Pricing/Subscription Page
 * 
 * Tier 2: Retail Subscription
 * Displays Pro and Premium subscription tiers
 * Allows payment with $FLOW token or traditional payment methods
 */

'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import * as Tooltip from '@/components/ui/Tooltip'

interface PricingTier {
  name: string
  price: number
  priceInFLOW: number
  description: string
  features: string[]
  popular?: boolean
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: 0,
    priceInFLOW: 0,
    description: 'Basic access to FlowSight platform',
    features: [
      'View Global LSP Index',
      'Basic whale tracker (top 10)',
      'Standard alert feed',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: 49,
    priceInFLOW: 5000, // Example: 5000 FLOW tokens
    description: 'For professional traders and analysts',
    features: [
      'Full dashboard access',
      'All alert customizations',
      '5 Whale Wallet tracking slots',
      'Advanced LSP Index analytics',
      'Priority support',
      'Historical data access (30 days)',
    ],
    popular: true,
  },
  {
    name: 'Premium',
    price: 149,
    priceInFLOW: 15000, // Example: 15000 FLOW tokens
    description: 'Access to predictive model parameters and exclusive research',
    features: [
      'Everything in Pro',
      'Predictive model parameters',
      'Exclusive research reports',
      'Unlimited Whale Wallet tracking',
      'Historical data access (1 year)',
      'API access (limited)',
      'Direct support from team',
      'Early access to new features',
    ],
  },
]

export default function PricingPage() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'fiat' | 'flow'>('fiat')

  const handleSubscribe = (tier: PricingTier) => {
    // TODO: Implement subscription logic
    console.log(`Subscribing to ${tier.name} tier with ${paymentMethod} payment`)
    // This would integrate with backend subscription API
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 font-mono text-electric-cyan">
            Choose Your Plan
          </h1>
          <p className="text-xl text-light-gray mb-6">
            Unlock the power of predictive liquidity analytics
          </p>
          <p className="text-sm text-light-gray/70 mb-8">
            Pay with $FLOW tokens and receive up to 20% discount
          </p>

          {/* Payment Method Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-light-gray">Payment Method:</span>
            <div className="flex gap-2">
              <Button
                variant={paymentMethod === 'fiat' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('fiat')}
                className="px-6"
              >
                USD / Crypto
              </Button>
              <Button
                variant={paymentMethod === 'flow' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('flow')}
                className="px-6"
              >
                $FLOW Token
                <Badge variant="secondary" className="ml-2">
                  20% Off
                </Badge>
              </Button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative bg-midnight-blue/50 border rounded-lg p-8 ${
                tier.popular
                  ? 'border-electric-cyan border-2 scale-105'
                  : 'border-electric-cyan/30'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="default" className="px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold font-mono text-electric-cyan mb-2">
                  {tier.name}
                </h3>
                <p className="text-light-gray/70 text-sm mb-4">
                  {tier.description}
                </p>
                <div className="mb-4">
                  {tier.price === 0 ? (
                    <span className="text-4xl font-bold text-light-gray">Free</span>
                  ) : (
                    <div>
                      {paymentMethod === 'flow' ? (
                        <div>
                          <span className="text-4xl font-bold text-electric-cyan">
                            {tier.priceInFLOW.toLocaleString()}
                          </span>
                          <span className="text-light-gray ml-2">FLOW</span>
                          <div className="text-sm text-light-gray/70 mt-1 line-through">
                            ${tier.price}/month
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-4xl font-bold text-electric-cyan">
                            ${tier.price}
                          </span>
                          <span className="text-light-gray ml-2">/month</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-electric-cyan mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-light-gray text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(tier)}
                variant={tier.popular ? 'default' : 'outline'}
                className="w-full"
                disabled={tier.name === 'Free'}
              >
                {tier.name === 'Free' ? 'Current Plan' : 'Subscribe Now'}
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <Tooltip.TooltipProvider>
            <Tooltip.Tooltip>
              <Tooltip.TooltipTrigger asChild>
                <p className="text-light-gray/70 text-sm cursor-help">
                  All subscriptions include access to the LSP Index and Whale Tracker Dashboard.
                  <br />
                  <span className="text-electric-cyan underline">
                    Learn more about $FLOW token benefits
                  </span>
                </p>
              </Tooltip.TooltipTrigger>
              <Tooltip.TooltipContent className="max-w-md">
                <p>
                  Paying with $FLOW tokens provides additional benefits:
                  <br />• 20% discount on all subscriptions
                  <br />• Governance voting rights
                  <br />• Access to exclusive token holder features
                  <br />• Support the deflationary mechanism
                </p>
              </Tooltip.TooltipContent>
            </Tooltip.Tooltip>
          </Tooltip.TooltipProvider>
        </div>
      </div>

      <Footer />
    </main>
  )
}

