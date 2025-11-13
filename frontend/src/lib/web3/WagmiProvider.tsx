/**
 * Wagmi Provider Component
 * 
 * Provides Wagmi and RainbowKit configuration for Web3 wallet connections
 * Based on learna project pattern
 */

'use client'

import React from 'react';
import { WagmiProvider as WagmiProviderBase } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import { hardhat, bscTestnet } from 'wagmi/chains';
import DataProvider from './DataProvider';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletConnect may not work properly.')
}

// Create QueryClient instance outside component (singleton)
let queryClient: QueryClient | undefined

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
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
  }
  return queryClient
}

// Create config outside component (singleton pattern to prevent double initialization)
let wagmiConfig: ReturnType<typeof getDefaultConfig> | undefined

function getWagmiConfig() {
  if (!wagmiConfig) {
    wagmiConfig = getDefaultConfig({
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
  }
  return wagmiConfig
}

// Create theme (can be recreated, no side effects)
// Using exact brand colors from PT.md:
// Primary: Deep Midnight Blue (#0A1931)
// Secondary: High-Contrast Electric Cyan (#00FFFF)
// Using darkTheme to match FlowSight's Deep-Sea Surveillance aesthetic
const theme = darkTheme({
  accentColor: '#00FFFF', // Electric Cyan - exact brand color
  accentColorForeground: '#0A1931', // Deep Midnight Blue - exact brand color
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
})

export default function WagmiProvider({ children }: { children: React.ReactNode }) {
  // Use singleton instances to prevent double initialization
  const config = getWagmiConfig()
  const client = getQueryClient()

  return (
    <WagmiProviderBase config={config}>
      <QueryClientProvider client={client}>
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
