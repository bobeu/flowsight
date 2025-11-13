/**
 * Root Layout Component
 * 
 * This is the root layout for the FlowSight application.
 * Sets up global styles, fonts, and metadata.
 */

import type { Metadata } from 'next'
import { Inter, Space_Mono } from 'next/font/google'
import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'
import WagmiProvider from '@/lib/web3/WagmiProvider'
import TransactionProvider from '@/lib/context/TransactionContext'
import TransactionStatusMonitorWrapper from './TransactionStatusMonitorWrapper'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
})

export const metadata: Metadata = {
  title: 'FlowSight - The Oracle of Flow',
  description: 'Predicting Crypto Liquidity Shocks. Decentrally.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceMono.variable} font-sans bg-midnight-blue text-light-gray`}>
        <WagmiProvider>
          <TransactionProvider>
            {children}
            <TransactionStatusMonitorWrapper />
          </TransactionProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}

