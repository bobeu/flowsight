/**
 * Contract Utilities
 * 
 * Utilities for loading contract addresses and ABIs from synced artifacts
 */

import globalContractData from './contracts.json'

export type ContractName = 'FLOWToken' | 'CuratorStaking' | 'WhaleAlertBidding' | 'Governance'
export type NetworkName = 'bnbTestnet'

interface ContractAddresses {
  FLOWToken?: string
  CuratorStaking?: string
  WhaleAlertBidding?: string
  Governance?: string
}

/**
 * Get contract address for a given contract and chain
 */
export function getContractAddress(
  contractName: ContractName,
  chainId: number
): string | null {
  const chainName = getChainName(chainId)
  if (!chainName) return null

  const addresses = globalContractData.contractAddresses[chainName] as ContractAddresses
  return addresses?.[contractName] || null
}

/**
 * Get chain name from chain ID
 */
export function getChainName(chainId: number): NetworkName | null {
  const chainNames = globalContractData.chainName as Record<string, string>
  const chainIdStr = chainId.toString()
  const name = chainNames[chainIdStr]
  
  if (name === 'bnbTestnet') {
    return name
  }
  
  return null
}

/**
 * Get contract ABI and address
 * @param contractName Name of the contract
 * @param networkOrChainId Network name or chain ID (if number, will be converted to network name)
 */
export async function getContractData(
  contractName: ContractName,
  networkOrChainId: NetworkName | number = 'bnbTestnet'
): Promise<{ address: string; abi: any[] } | null> {
  try {
    // Convert chainId to network name if needed
    let network: NetworkName
    if (typeof networkOrChainId === 'number') {
      const chainName = getChainName(networkOrChainId)
      if (!chainName) {
        console.error(`Unsupported chain ID: ${networkOrChainId}`)
        return null
      }
      network = chainName
    } else {
      network = networkOrChainId
    }

    const contractData = await import(`./${network}/${contractName}.json`)
    return {
      address: contractData.address,
      abi: contractData.abi,
    }
  } catch (error) {
    console.error(`Error loading contract ${contractName} for network ${networkOrChainId}:`, error)
    return null
  }
}

/**
 * Get all contract addresses for a chain
 */
export function getContractAddresses(chainId: number): ContractAddresses {
  const chainName = getChainName(chainId)
  if (!chainName) return {}
  
  return (globalContractData.contractAddresses[chainName] as ContractAddresses) || {}
}

