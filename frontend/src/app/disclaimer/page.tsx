/**
 * Legal Disclaimer Page
 * 
 * Displays the legal disclaimer and risk disclosure as required by PROMPT.md.
 * Must be prominently displayed before users can access LSP Index or Whale Alerts.
 */

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 font-mono text-electric-cyan">
          Legal Disclaimer & Risk Disclosure
        </h1>

        <div className="bg-midnight-blue/50 border border-electric-cyan/30 rounded-lg p-8 space-y-6 text-light-gray">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-electric-cyan font-mono">
              1. No Investment or Financial Advice
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-light-gray">
                  1.1 Informational Purpose Only
                </h3>
                <p>
                  The information, data feeds, and proprietary metrics provided by FlowSight, 
                  including the <strong>Liquidity Shock Prediction (LSP) Index</strong> and all 
                  associated alerts, are strictly for <strong>informational, educational, and 
                  entertainment purposes only.</strong>
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-light-gray">
                  1.2 No Advice
                </h3>
                <p>
                  Nothing provided by FlowSight constitutes financial advice, investment advice, 
                  trading advice, or a recommendation to buy, sell, or hold any cryptocurrency 
                  or digital asset.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-light-gray">
                  1.3 User Responsibility
                </h3>
                <p>
                  You are solely responsible for all investment decisions, trades, orders, and 
                  strategies you implement. You should not treat any information from FlowSight 
                  as a solicitation or recommendation to engage in speculative trading or 
                  investment activities. Consult a licensed financial professional before making 
                  any financial decisions.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-electric-cyan font-mono">
              2. Risk Disclosure & Volatility Warning
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-light-gray">
                  2.1 Extreme Volatility
                </h3>
                <p>
                  Trading cryptocurrencies involves substantial risk and is not suitable for all 
                  investors. The market is highly volatile, subject to unpredictable price swings, 
                  and can result in significant, sudden, and total loss of capital.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-light-gray">
                  2.2 Prediction Limitations
                </h3>
                <p>
                  The <strong>LSP Index</strong> is a mathematical prediction model based on 
                  historical and real-time on-chain data. It is <strong>not a guarantee</strong> of 
                  future market performance. The model may generate inaccurate predictions due to 
                  unforeseen events, market manipulation, data feed errors, or fundamental changes 
                  in the market structure.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-light-gray">
                  2.3 Total Loss Risk
                </h3>
                <p>
                  You should be prepared to lose all the money you use to trade or invest in crypto 
                  assets. FlowSight does not guarantee profits or provide any capital protection.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-electric-cyan font-mono">
              3. Limitation of Liability
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-light-gray">
                  3.1 Limitation of Damages
                </h3>
                <p>
                  FlowSight, its affiliates, employees, and contributors (including <strong>$FLOW</strong> Curators) 
                  shall not be liable for any direct, indirect, incidental, consequential, special, or exemplary 
                  damages, including but not limited to, damages for loss of profits, loss of data, or any other 
                  loss resulting from your use of or reliance on the <strong>LSP Index</strong> or any other 
                  information provided by the platform.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-light-gray">
                  3.2 "As Is" Basis
                </h3>
                <p>
                  All services and data are provided on an "as is" and "as available" basis without any 
                  warranties, express or implied, including but not limited to, warranties of merchantability, 
                  fitness for a particular purpose, or non-infringement.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-electric-cyan font-mono">
              4. Regulatory & Token Risk
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-light-gray">
                  4.1 Regulatory Uncertainty
                </h3>
                <p>
                  The regulatory landscape for cryptocurrencies and prediction services is uncertain and 
                  subject to change. Access to FlowSight may be restricted or terminated based on changes 
                  in local laws. FlowSight makes no representation that the services are appropriate or 
                  available for use in all jurisdictions. Users are responsible for ensuring compliance 
                  with their local laws.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-light-gray">
                  4.2 $FLOW Token Risk
                </h3>
                <p>
                  The <strong>$FLOW</strong> token is a utility token. Its value is highly volatile and 
                  subject to market risk. Its utility (e.g., access, staking) is dependent on the continued 
                  development and successful operation of the FlowSight platform, which is not guaranteed.
                </p>
              </div>
            </div>
          </section>

          <div className="mt-8 p-4 bg-electric-cyan/10 border border-electric-cyan/30 rounded">
            <p className="text-sm text-light-gray/80">
              <strong>Note:</strong> This disclaimer is for informational purposes only. FlowSight 
              recommends consulting a qualified legal professional specializing in FinTech/Crypto law 
              for specific legal advice.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <Button asChild variant="default" className="px-8 py-4 text-base font-bold">
              <Link href="/" className="w-full text-center">
                I Understand - Continue to FlowSight
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

