/**
 * Animated Metric Component
 * 
 * Displays animated numbers that count up to their target value
 * Enhanced with bold typography, glow effects, and theme-compliant styling
 * Creates dynamic, engaging visual feedback aligned with FlowSight's Deep-Sea Surveillance theme
 */

'use client'

import { useEffect, useState, useRef } from 'react'

interface AnimatedMetricProps {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
  decimals?: number
  className?: string
  label?: string
  showGlow?: boolean
}

export default function AnimatedMetric({
  value,
  suffix = '',
  prefix = '',
  duration = 2000,
  decimals = 0,
  className = '',
  label,
  showGlow = true,
}: AnimatedMetricProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [liveValue, setLiveValue] = useState(value)
  const [pulseIntensity, setPulseIntensity] = useState(1)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)
  const countUpAnimationRef = useRef<number | null>(null)
  const pulseAnimationRef = useRef<number | null>(null)
  const liveUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Intersection Observer to trigger animation when in view
    const currentElement = elementRef.current
    if (currentElement) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isVisible) {
              setIsVisible(true)
            }
          })
        },
        { threshold: 0.1 }
      )
      observerRef.current.observe(currentElement)
    }

    return () => {
      if (observerRef.current && currentElement) {
        observerRef.current.unobserve(currentElement)
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)

      const currentValue = startValue + (value - startValue) * easeOut
      setDisplayValue(currentValue)

      if (progress < 1) {
        countUpAnimationRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
        setLiveValue(value)
      }
    }

    animate()

    return () => {
      if (countUpAnimationRef.current) {
        cancelAnimationFrame(countUpAnimationRef.current)
      }
    }
  }, [isVisible, value, duration])

  // Add live data simulation - subtle fluctuations to make it look dynamic
  useEffect(() => {
    if (!isVisible || displayValue === 0) return

    let firstUpdateTimeout: NodeJS.Timeout | null = null
    let startLiveUpdatesTimeout: NodeJS.Timeout | null = null

    // Start live updates after initial animation completes
    startLiveUpdatesTimeout = setTimeout(() => {
      // First update after a short delay
      firstUpdateTimeout = setTimeout(() => {
        const fluctuationRange = value * 0.003 // 0.3% max fluctuation
        const randomFluctuation = (Math.random() - 0.5) * 2 * fluctuationRange
        setLiveValue(value + randomFluctuation)
      }, 1000)

      // Then set up interval for periodic updates
      liveUpdateIntervalRef.current = setInterval(() => {
        // Add subtle random fluctuations (±0.1% to ±0.3% of value)
        const fluctuationRange = value * 0.003 // 0.3% max fluctuation
        const randomFluctuation = (Math.random() - 0.5) * 2 * fluctuationRange
        const newLiveValue = value + randomFluctuation
        setLiveValue(newLiveValue)
      }, 2500 + Math.random() * 2000) // Update every 2.5-4.5 seconds randomly
    }, duration + 500) // Start after initial animation

    return () => {
      if (startLiveUpdatesTimeout) {
        clearTimeout(startLiveUpdatesTimeout)
      }
      if (firstUpdateTimeout) {
        clearTimeout(firstUpdateTimeout)
      }
      if (liveUpdateIntervalRef.current) {
        clearInterval(liveUpdateIntervalRef.current)
      }
    }
  }, [isVisible, displayValue, value, duration])

  // Pulsing glow animation with smooth sine wave
  useEffect(() => {
    if (!isVisible || !showGlow) return

    let startTime = Date.now()
    const pulseDuration = 3000 // 3 seconds for full pulse cycle

    const pulseAnimation = () => {
      const elapsed = Date.now() - startTime
      const progress = (elapsed % pulseDuration) / pulseDuration
      // Sine wave for smooth pulsing between 0.85 and 1.15
      const sineValue = Math.sin(progress * Math.PI * 2)
      const newIntensity = 1 + (sineValue * 0.15) // Pulse between 0.85 and 1.15
      setPulseIntensity(newIntensity)
      
      pulseAnimationRef.current = requestAnimationFrame(pulseAnimation)
    }

    pulseAnimation()

    return () => {
      if (pulseAnimationRef.current) {
        cancelAnimationFrame(pulseAnimationRef.current)
      }
    }
  }, [isVisible, showGlow])

  // Use live value for display after initial animation completes
  const currentDisplayValue = displayValue >= value ? liveValue : displayValue
  
  const formattedValue = currentDisplayValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <div ref={elementRef} className={`relative ${className}`}>
      {/* Glow effect behind the number with pulsing animation */}
      {showGlow && (
        <div 
          className="absolute inset-0 blur-2xl transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle, #00FFFF 0%, transparent 70%)',
            opacity: 0.2 + (pulseIntensity - 1) * 0.2, // Pulse between 0.2 and 0.4
            transform: `scale(${pulseIntensity})`,
            transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
          }}
        />
      )}
      
      {/* Main number display */}
      <div className="relative z-10">
        <span className="inline-block">
          {prefix && (
            <span 
              className="text-electric-cyan/80 font-mono font-bold"
              style={{
                textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
              }}
            >
              {prefix}
            </span>
          )}
          <span
            className="font-mono font-extrabold text-electric-cyan transition-all duration-700 ease-out"
            style={{
              textShadow: showGlow 
                ? `0 0 ${20 * pulseIntensity}px rgba(0, 255, 255, ${0.4 + (pulseIntensity - 1) * 0.3}), 0 0 ${40 * pulseIntensity}px rgba(0, 255, 255, ${0.2 + (pulseIntensity - 1) * 0.2}), 0 0 ${60 * pulseIntensity}px rgba(0, 255, 255, ${0.1 + (pulseIntensity - 1) * 0.1})`
                : '0 0 10px rgba(0, 255, 255, 0.4)',
              letterSpacing: '0.05em',
              transform: `scale(${0.98 + (pulseIntensity - 1) * 0.04})`, // Subtle scale pulse
              transition: 'transform 0.7s ease-in-out, text-shadow 0.7s ease-in-out, opacity 0.7s ease-in-out',
            }}
          >
            {formattedValue}
          </span>
          {suffix && (
            <span 
              className="text-electric-cyan/90 font-mono font-bold ml-1"
              style={{
                textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                fontSize: '0.8em',
              }}
            >
              {suffix}
            </span>
          )}
        </span>
      </div>
      
      {/* Optional label */}
      {label && (
        <div className="mt-2 text-xs text-light-gray/60 font-mono tracking-wider uppercase">
          {label}
        </div>
      )}
    </div>
  )
}

