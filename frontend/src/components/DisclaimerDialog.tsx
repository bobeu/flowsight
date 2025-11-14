/**
 * Disclaimer Dialog Component
 * 
 * Modal dialog that appears on homepage requiring user acceptance
 * before accessing Whale dashboard
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

const DISCLAIMER_ACCEPTED_KEY = 'flowsight_disclaimer_accepted'

export default function DisclaimerDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if disclaimer has been accepted
    const accepted = localStorage.getItem(DISCLAIMER_ACCEPTED_KEY)
    
    if (!accepted) {
      // Show dialog after a short delay (few milliseconds)
      const timer = setTimeout(() => {
        setOpen(true)
      }, 100) // 100ms delay
      
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    // Mark disclaimer as accepted
    localStorage.setItem(DISCLAIMER_ACCEPTED_KEY, 'true')
    setOpen(false)
  }

  const handleViewFull = () => {
    // Close dialog and navigate to full disclaimer page
    setOpen(false)
    router.push('/disclaimer')
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Prevent closing without accepting
      if (!newOpen && !isDisclaimerAccepted()) {
        return
      }
      setOpen(newOpen)
    }}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl mb-4">
            Legal Disclaimer & Risk Disclosure
          </DialogTitle>
          <DialogDescription className="text-left space-y-4">
            <div className="space-y-4 text-light-gray">
              <section>
                <h3 className="text-lg font-semibold mb-2 text-electric-cyan">
                  1. No Investment or Financial Advice
                </h3>
                <p className="text-sm mb-2">
                  The information provided by FlowSight, including the <strong>Liquidity Shock Prediction (LSP) Index</strong> 
                  and all associated alerts, are strictly for <strong>informational, educational, and entertainment purposes only.</strong>
                </p>
                <p className="text-sm">
                  Nothing provided by FlowSight constitutes financial advice, investment advice, trading advice, or a recommendation 
                  to buy, sell, or hold any cryptocurrency or digital asset.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2 text-electric-cyan">
                  2. Risk Disclosure & Volatility Warning
                </h3>
                <p className="text-sm mb-2">
                  Trading cryptocurrencies involves substantial risk and is not suitable for all investors. The market is highly volatile, 
                  subject to unpredictable price swings, and can result in significant, sudden, and total loss of capital.
                </p>
                <p className="text-sm">
                  The <strong>LSP Index</strong> is a mathematical prediction model based on historical and real-time on-chain data. 
                  It is <strong>not a guarantee</strong> of future market performance.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2 text-electric-cyan">
                  3. Limitation of Liability
                </h3>
                <p className="text-sm">
                  FlowSight, its affiliates, employees, and contributors shall not be liable for any direct, indirect, incidental, 
                  consequential, special, or exemplary damages resulting from your use of or reliance on the <strong>LSP Index</strong> 
                  or any other information provided by the platform.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2 text-electric-cyan">
                  4. Regulatory & Token Risk
                </h3>
                <p className="text-sm">
                  The regulatory landscape for cryptocurrencies is uncertain and subject to change. The <strong>$FLOW</strong> token 
                  is a utility token with highly volatile value subject to market risk.
                </p>
              </section>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleViewFull}
            className="w-full sm:w-auto"
          >
            View Full Disclaimer
          </Button>
          <Button
            onClick={handleAccept}
            className="w-full sm:w-auto"
          >
            I Understand - Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Check if disclaimer has been accepted
 */
export function isDisclaimerAccepted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(DISCLAIMER_ACCEPTED_KEY) === 'true'
}

/**
 * Clear disclaimer acceptance (for testing/logout)
 */
export function clearDisclaimerAcceptance(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DISCLAIMER_ACCEPTED_KEY)
  }
}

