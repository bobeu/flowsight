/**
 * Animated Metric Component
 * 
 * Displays animated numbers that count up to their target value
 * Creates dynamic, engaging visual feedback
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
}

export default function AnimatedMetric({
  value,
  suffix = '',
  prefix = '',
  duration = 2000,
  decimals = 0,
  className = '',
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

  return (
    <div ref={elementRef} className={className}>
      {prefix}
      {displayValue.toFixed(decimals).toLocaleString()}
      {suffix}
    </div>
  )
}

