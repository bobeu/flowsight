/**
 * Utility functions
 * 
 * Helper functions for className merging and other utilities
 */

import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

