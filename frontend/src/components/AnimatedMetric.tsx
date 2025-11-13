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
  const observerRef = useRef<IntersectionObserver | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Intersection Observer to trigger animation when in view
    if (elementRef.current) {
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
      observerRef.current.observe(elementRef.current)
    }

    return () => {
      if (observerRef.current && elementRef.current) {
        observerRef.current.unobserve(elementRef.current)
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
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    animate()
  }, [isVisible, value, duration])

  const formattedValue = displayValue.toFixed(decimals).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <div ref={elementRef} className={`relative ${className}`}>
      {/* Glow effect behind the number */}
      {showGlow && (
        <div 
          className="absolute inset-0 blur-2xl opacity-30 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle, #00FFFF 0%, transparent 70%)',
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
            className="font-mono font-extrabold text-electric-cyan transition-all duration-300"
            style={{
              textShadow: showGlow 
                ? '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.3), 0 0 60px rgba(0, 255, 255, 0.1)'
                : '0 0 10px rgba(0, 255, 255, 0.4)',
              letterSpacing: '0.05em',
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

