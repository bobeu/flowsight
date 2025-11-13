/**
 * Header Component
 * 
 * Main navigation header for FlowSight
 * Includes logo, navigation links, and theme styling
 * Uses Radix UI components for accessibility
 */

'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import * as Tooltip from '@/components/ui/Tooltip';
import * as DropdownMenu from '@/components/ui/DropdownMenu';
import { isDisclaimerAccepted } from '@/components/DisclaimerDialog';
import ConnectionStatus from '@/components/ConnectionStatus';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [featuresMenuOpen, setFeaturesMenuOpen] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setAccepted(isDisclaimerAccepted())
    
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  const handleWhaleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isDisclaimerAccepted()) {
      e.preventDefault()
      router.push('/')
    }
    setMobileMenuOpen(false)
  }

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <Tooltip.TooltipProvider>
      <header className="bg-midnight-blue border-b border-electric-cyan/20">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Tooltip.Tooltip>
              <Tooltip.TooltipTrigger asChild>
                <Link 
                  href="/" 
                  className="flex items-center gap-2 text-xl sm:text-2xl font-bold font-mono text-electric-cyan hover:text-electric-cyan/80 transition-colors"
                  onClick={handleLinkClick}
                >
                  <Image
                    src="/logo.png"
                    alt="FlowSight Logo"
                    width={64}
                    height={64}
                    className="w-12 h-12 sm:w-16 sm:h-16"
                    priority
                  />
                  FlowSight
                </Link>
              </Tooltip.TooltipTrigger>
              <Tooltip.TooltipContent>
                <p>The Oracle of Flow</p>
              </Tooltip.TooltipContent>
            </Tooltip.Tooltip>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <ConnectButton />
              <ConnectionStatus />
              
              <Tooltip.Tooltip>
                <Tooltip.TooltipTrigger asChild>
                  <Link 
                    href="/" 
                    className="text-light-gray hover:text-electric-cyan transition-colors text-sm"
                  >
                    Home
                  </Link>
                </Tooltip.TooltipTrigger>
                <Tooltip.TooltipContent>
                  <p>View LSP Index and Price Charts</p>
                </Tooltip.TooltipContent>
              </Tooltip.Tooltip>
              
              <DropdownMenu.DropdownMenu 
                open={featuresMenuOpen} 
                onOpenChange={setFeaturesMenuOpen}
                modal={false}
              >
                <DropdownMenu.DropdownMenuTrigger asChild>
                  <button 
                    className="text-light-gray hover:text-electric-cyan transition-colors text-sm flex items-center gap-1 outline-none"
                    onMouseEnter={(e) => {
                      e.stopPropagation()
                      if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current)
                        hoverTimeoutRef.current = null
                      }
                      setFeaturesMenuOpen(true)
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation()
                      // Don't close immediately, wait a bit
                      hoverTimeoutRef.current = setTimeout(() => {
                        setFeaturesMenuOpen(false)
                      }, 150)
                    }}
                  >
                    Features
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </DropdownMenu.DropdownMenuTrigger>
                <DropdownMenu.DropdownMenuContent 
                  align="start" 
                  className="w-48"
                  sideOffset={0}
                  onMouseEnter={(e) => {
                    e.stopPropagation()
                    if (hoverTimeoutRef.current) {
                      clearTimeout(hoverTimeoutRef.current)
                      hoverTimeoutRef.current = null
                    }
                    setFeaturesMenuOpen(true)
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation()
                    hoverTimeoutRef.current = setTimeout(() => {
                      setFeaturesMenuOpen(false)
                    }, 150)
                  }}
                >
                  <DropdownMenu.DropdownMenuItem asChild>
                    <Link 
                      href="/whales" 
                      onClick={handleWhaleClick}
                      className="cursor-pointer"
                    >
                      Whale Tracker
                    </Link>
                  </DropdownMenu.DropdownMenuItem>
                  <DropdownMenu.DropdownMenuItem asChild>
                    <Link 
                      href="/pricing" 
                      className="cursor-pointer"
                    >
                      Pricing
                    </Link>
                  </DropdownMenu.DropdownMenuItem>
                  <DropdownMenu.DropdownMenuItem asChild>
                    <Link 
                      href="/api-access" 
                      className="cursor-pointer"
                    >
                      API Access
                    </Link>
                  </DropdownMenu.DropdownMenuItem>
                  <DropdownMenu.DropdownMenuItem asChild>
                    <Link 
                      href="/flow-token" 
                      className="cursor-pointer"
                    >
                      $FLOW Token
                    </Link>
                  </DropdownMenu.DropdownMenuItem>
                </DropdownMenu.DropdownMenuContent>
              </DropdownMenu.DropdownMenu>
              
              <Tooltip.Tooltip>
                <Tooltip.TooltipTrigger asChild>
                  <Link 
                    href="/disclaimer" 
                    className="text-light-gray hover:text-electric-cyan transition-colors text-sm"
                  >
                    Disclaimer
                  </Link>
                </Tooltip.TooltipTrigger>
                <Tooltip.TooltipContent>
                  <p>Legal disclaimer and risk disclosure</p>
                </Tooltip.TooltipContent>
              </Tooltip.Tooltip>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-electric-cyan hover:text-electric-cyan/80 transition-colors p-2"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-electric-cyan/20 pt-4">
              <div className="flex flex-col space-y-4">
                <div className="mb-2">
                  <ConnectionStatus />
                </div>
                
                <Link
                  href="/"
                  onClick={handleLinkClick}
                  className="text-light-gray hover:text-electric-cyan transition-colors py-2"
                >
                  Home
                </Link>
                
                <div className="flex flex-col space-y-2 pl-4 border-l border-electric-cyan/20">
                  <p className="text-electric-cyan text-sm font-semibold mb-1">Features</p>
                  <Link
                    href="/whales"
                    onClick={handleWhaleClick}
                    className="text-light-gray hover:text-electric-cyan transition-colors py-1 text-sm"
                  >
                    Whale Tracker
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={handleLinkClick}
                    className="text-light-gray hover:text-electric-cyan transition-colors py-1 text-sm"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/api-access"
                    onClick={handleLinkClick}
                    className="text-light-gray hover:text-electric-cyan transition-colors py-1 text-sm"
                  >
                    API Access
                  </Link>
                  <Link
                    href="/flow-token"
                    onClick={handleLinkClick}
                    className="text-light-gray hover:text-electric-cyan transition-colors py-1 text-sm"
                  >
                    $FLOW Token
                  </Link>
                </div>
                
                <Link
                  href="/disclaimer"
                  onClick={handleLinkClick}
                  className="text-light-gray hover:text-electric-cyan transition-colors py-2"
                >
                  Disclaimer
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>
    </Tooltip.TooltipProvider>
  )
}

