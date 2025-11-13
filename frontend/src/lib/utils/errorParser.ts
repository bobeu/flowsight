/**
 * Error Parser Utility
 * 
 * Parses Web3 and contract errors into user-friendly messages
 */

export interface ParsedError {
  message?: string
  code?: string
  userAction?: string
  data?: {
    message?: string;
  }
}

/**
 * Parse Web3/contract errors into user-friendly messages
 */
export function parseContractError(error: unknown): ParsedError {
  const errorObj = error as any
  // Use the specified format: error?.message || error?.data?.message || error
  const errorMessage = errorObj?.message || errorObj?.data?.message || errorObj || ''
  // Convert to string if not already
  const errorMessageStr = typeof errorMessage === 'string' ? errorMessage : String(errorMessage)
  const errorCode = errorObj?.code || errorObj?.error?.code

  // User rejection
  if (
    errorMessageStr.includes('User rejected') ||
    errorMessageStr.includes('user rejected') ||
    errorMessageStr.includes('User denied') ||
    errorCode === 4001
  ) {
    return {
      message: 'Transaction was cancelled',
      code: 'USER_REJECTED',
      userAction: 'Please approve the transaction in your wallet to continue',
    }
  }

  // Insufficient funds for gas
  if (
    errorMessageStr.includes('insufficient funds') ||
    errorMessageStr.includes('Insufficient funds')
  ) {
    return {
      message: 'Insufficient funds for gas fees',
      code: 'INSUFFICIENT_FUNDS',
      userAction: 'Please add more ETH/BNB to your wallet for transaction fees',
    }
  }

  // Insufficient token balance
  if (
    errorMessageStr.includes('Insufficient balance') ||
    errorMessageStr.includes('insufficient balance') ||
    errorMessageStr.includes('ERC20: transfer amount exceeds balance')
  ) {
    return {
      message: 'Insufficient token balance',
      code: 'INSUFFICIENT_BALANCE',
      userAction: 'Please ensure you have enough FLOW tokens in your wallet',
    }
  }

  // Insufficient allowance
  if (
    errorMessageStr.includes('Insufficient allowance') ||
    errorMessageStr.includes('insufficient allowance') ||
    errorMessageStr.includes('ERC20: insufficient allowance')
  ) {
    return {
      message: 'Token approval required',
      code: 'INSUFFICIENT_ALLOWANCE',
      userAction: 'Please approve the token spending first',
    }
  }

  // Contract-specific errors
  if (errorMessageStr.includes('CuratorStaking:')) {
    const contractError = errorMessageStr.split('CuratorStaking:')[1]?.trim()
    
    if (contractError.includes('Min stake')) {
      return {
        message: 'Stake amount below minimum requirement',
        code: 'MIN_STAKE_ERROR',
        userAction: 'Please stake at least 10,000 FLOW tokens',
      }
    }
    
    if (contractError.includes('Already a curator')) {
      return {
        message: 'You are already a curator',
        code: 'ALREADY_CURATOR',
        userAction: 'You can add more tokens to your existing stake',
      }
    }
  }

  if (errorMessageStr.includes('WhaleAlertBidding:')) {
    const contractError = errorMessageStr.split('WhaleAlertBidding:')[1]?.trim()
    
    if (contractError.includes('Bid amount below minimum')) {
      return {
        message: 'Bid amount below minimum',
        code: 'MIN_BID_ERROR',
        userAction: 'Please bid at least 100 FLOW tokens',
      }
    }
    
    if (contractError.includes('New bid must be higher')) {
      return {
        message: 'Your bid must be higher than the current highest bid',
        code: 'BID_TOO_LOW',
        userAction: 'Please increase your bid amount',
      }
    }
  }

  // Network errors
  if (
    errorMessageStr.includes('network') ||
    errorMessageStr.includes('Network') ||
    errorMessageStr.includes('chain') ||
    errorMessageStr.includes('Chain mismatch')
  ) {
    return {
      message: 'Network error occurred',
      code: 'NETWORK_ERROR',
      userAction: 'Please check your network connection and try again',
    }
  }

  // Gas errors
  if (
    errorMessageStr.includes('gas') ||
    errorMessageStr.includes('Gas') ||
    errorMessageStr.includes('out of gas')
  ) {
    return {
      message: 'Transaction failed due to gas issues',
      code: 'GAS_ERROR',
      userAction: 'Please try again or increase gas limit',
    }
  }

  // Execution reverted (generic contract error)
  if (
    errorMessageStr.includes('execution reverted') ||
    errorMessageStr.includes('revert') ||
    errorMessageStr.includes('REVERT')
  ) {
    // Try to extract the reason
    const reasonMatch = errorMessageStr.match(/reason:?\s*([^,]+)/i) ||
                       errorMessageStr.match(/revert\s+([^,]+)/i)
    
    if (reasonMatch && reasonMatch[1]) {
      return {
        message: `Transaction failed: ${reasonMatch[1].trim()}`,
        code: 'EXECUTION_REVERTED',
        userAction: 'Please check the transaction details and try again',
      }
    }
    
    return {
      message: 'Transaction failed',
      code: 'EXECUTION_REVERTED',
      userAction: 'Please check the transaction details and try again',
    }
  }

  // Default fallback
  return {
    message: errorMessageStr || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    userAction: 'Please try again or contact support if the issue persists',
  }
}

/**
 * Format error for display to user
 * Returns only the error message string (not the whole error object)
 */
export function formatErrorForDisplay(error: ParsedError): string {
  // Return only the message, clean and user-friendly
  return error.message || error.data?.message || 'An unexpected error occurred';
}

/**
 * Get error message from any error type
 * Extracts only the message string, not the whole error object
 * Uses format: error?.message || error?.data?.message || error
 * Truncates long technical error messages to user-friendly ones
 */
export function getErrorMessage(error: unknown): string {
  const errorObj = error as any
  
  // Use the specified format: error?.message || error?.data?.message || error
  const errorMessage = errorObj?.message || errorObj?.data?.message || error
  
  // Convert to string if not already
  let errorMessageStr: string
  if (typeof errorMessage === 'string') {
    errorMessageStr = errorMessage
  } else if (errorMessage instanceof Error) {
    errorMessageStr = errorMessage.message
  } else {
    errorMessageStr = String(errorMessage)
  }
  
  // Check if error message is too long (between 50-100 characters)
  // If so, provide a user-friendly message instead
  if (errorMessageStr.length > 50) {
    // Check for specific error types that indicate connection issues
    if (
      errorMessageStr.includes('RPC endpoint') ||
      errorMessageStr.includes('too many errors') ||
      errorMessageStr.includes('retrying') ||
      errorMessageStr.includes('Requested resource not available') ||
      errorMessageStr.includes('RPC endpoint returned')
    ) {
      return 'Network connection error. Please check your network connection and try again.'
    }
    
    // Check for contract-specific errors with technical details
    if (
      errorMessageStr.includes('Contract Call:') || 
      errorMessageStr.includes('function:') ||
      errorMessageStr.includes('Request Arguments:') ||
      errorMessageStr.includes('data: 0x')
    ) {
      return 'Transaction failed. Please ensure you are connected to the correct network and try again.'
    }
    
    // Generic truncation for other long errors
    if (errorMessageStr.length > 100) {
      // Try to extract a meaningful part, or use a generic message
      const firstLine = errorMessageStr.split('\n')[0]
      if (firstLine.length <= 100 && !firstLine.includes('0x') && !firstLine.includes('Request Arguments')) {
        return firstLine
      }
      return 'Transaction failed. Please try again or contact support if the issue persists.'
    }
  }
  
  // Parse the error to get user-friendly message
  const parsedError = parseContractError(error)
  const parsedMessage = parsedError.message || ''
  
  // If parsed message is still too long, truncate it
  if (parsedMessage.length > 100) {
    return 'Transaction failed. Please try again or contact support if the issue persists.'
  }
  
  return parsedMessage || 'An unexpected error occurred'
}

