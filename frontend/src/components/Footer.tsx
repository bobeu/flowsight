/**
 * Footer Component
 * 
 * Footer with legal disclaimers and links
 */

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-midnight-blue border-t border-electric-cyan/20 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-light-gray/70">
          <p className="mb-2">
            © 2025 FlowSight. All rights reserved.
          </p>
          <p className="mb-2">
            <strong>Disclaimer:</strong> FlowSight provides informational data only. 
            Not financial advice. Trade at your own risk.
          </p>
          <p className="mb-2">
            The LSP Index is a prediction model and does not guarantee future performance.
          </p>
          <p>
            <Link href="/disclaimer" className="text-electric-cyan hover:underline">
              Read Full Legal Disclaimer & Risk Disclosure
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

