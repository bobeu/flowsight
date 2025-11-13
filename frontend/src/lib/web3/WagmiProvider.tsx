/**
 * Wagmi Provider Component
 * 
 * Provides Wagmi and RainbowKit configuration for Web3 wallet connections
 * Based on learna project pattern
 */

'use client'

import React from 'react'
import { WagmiProvider as WagmiProviderBase } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, getDefaultConfig, lightTheme } from '@rainbow-me/rainbowkit'
import { http } from 'viem'
import { hardhat, bscTestnet } from 'wagmi/chains'
import '@rainbow-me/rainbowkit/styles.css'
import DataProvider from './DataProvider'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect may not work properly.')
}

// Create QueryClient instance outside component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Create config outside component
const config = getDefaultConfig({
  appName: 'FlowSight',
  projectId: projectId || 'default-project-id',
  appIcon: '/logo.png',
  appDescription: 'The Oracle of Flow - Predicting Crypto Liquidity Shocks',
  appUrl: typeof window !== 'undefined' ? window.location.origin : '',
  chains: [hardhat, bscTestnet],
  ssr: true,
  multiInjectedProviderDiscovery: true,
  pollingInterval: 30_000,
  syncConnectedChain: true,
  transports: {
    [hardhat.id]: http(),
    [bscTestnet.id]: http(process.env.NEXT_PUBLIC_BNB_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545'),
  },
})

// Create theme
const theme = lightTheme({
  accentColor: '#00D9FF', // Electric Cyan
  accentColorForeground: '#0A0E27', // Deep Midnight Blue
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
})

export default function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProviderBase config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          coolMode={true}
          modalSize="compact"
          theme={theme}
          initialChain={hardhat.id}
          showRecentTransactions={true}
          appInfo={{
            appName: 'FlowSight',
            learnMoreUrl: typeof window !== 'undefined' ? window.location.origin : '',
          }}
        >
          <DataProvider>
            {children}
          </DataProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProviderBase>
  )
}
