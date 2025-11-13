/**
 * Animated Flow Background Component
 * 
 * Creates animated particles/flow elements representing liquidity flow
 * Enhanced with larger blockchain-like connected nodes and moving formations
 * Includes 3 large crypto coins (BTC, ETH, BNB) as moving background elements
 */

'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  isLarge: boolean
  connections: number[]
}

interface Coin {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  rotationSpeed: number
  logo: 'BTC' | 'ETH' | 'BNB'
}

export default function AnimatedFlowBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const coinsRef = useRef<Coin[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      
      // Reinitialize coins on resize
      if (coinsRef.current.length === 0) {
        coinsRef.current = [
          {
            x: canvas.width * 0.2,
            y: canvas.height * 0.3,
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1,
            size: 120, // Very large size
            rotation: 0,
            rotationSpeed: 0.3,
            logo: 'BTC',
          },
          {
            x: canvas.width * 0.5,
            y: canvas.height * 0.6,
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1,
            size: 120,
            rotation: 0,
            rotationSpeed: 0.3,
            logo: 'ETH',
          },
          {
            x: canvas.width * 0.8,
            y: canvas.height * 0.4,
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1,
            size: 120,
            rotation: 0,
            rotationSpeed: 0.3,
            logo: 'BNB',
          },
        ]
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles with varied sizes
    const particleCount = 60
    const largeParticleCount = 8 // Number of large blockchain nodes
    
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: i < largeParticleCount ? Math.random() * 8 + 12 : Math.random() * 3 + 1, // Large: 12-20, Small: 1-4
      opacity: i < largeParticleCount ? 0.6 : Math.random() * 0.5 + 0.2,
      isLarge: i < largeParticleCount,
      connections: [],
    }))

    // Build blockchain-like connections between large particles
    const buildBlockchainConnections = () => {
      const largeParticles = particlesRef.current.filter(p => p.isLarge)
      
      largeParticles.forEach((particle, i) => {
        particle.connections = []
        
        // Connect to next particle in sequence (blockchain chain)
        if (i < largeParticles.length - 1) {
          const nextIndex = particlesRef.current.indexOf(largeParticles[i + 1])
          particle.connections.push(nextIndex)
        }
        
        // Also connect to a few nearby large particles (blockchain network)
        largeParticles.forEach((other, j) => {
          if (i !== j && j > i) {
            const dx = particle.x - other.x
            const dy = particle.y - other.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance < 200 && Math.random() > 0.7) {
              const otherIndex = particlesRef.current.indexOf(other)
              particle.connections.push(otherIndex)
            }
          }
        })
      })
    }

    buildBlockchainConnections()

    // Draw crypto coin logo
    const drawCoinLogo = (ctx: CanvasRenderingContext2D, logo: 'BTC' | 'ETH' | 'BNB', x: number, y: number, size: number) => {
      const logoSize = size * 0.5
      ctx.save()
      ctx.translate(x, y)

      switch (logo) {
        case 'BTC':
          // Bitcoin logo - Orange circle with B
          ctx.beginPath()
          ctx.arc(0, 0, logoSize / 2, 0, Math.PI * 2)
          ctx.fillStyle = '#F7931A'
          ctx.fill()
          
          ctx.fillStyle = 'white'
          ctx.font = `bold ${logoSize * 0.5}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('₿', 0, 0)
          break

        case 'ETH':
          // Ethereum logo - Blue circle with diamond
          ctx.beginPath()
          ctx.arc(0, 0, logoSize / 2, 0, Math.PI * 2)
          ctx.fillStyle = '#627EEA'
          ctx.fill()
          
          // Draw diamond shape
          ctx.beginPath()
          ctx.moveTo(0, -logoSize * 0.25)
          ctx.lineTo(logoSize * 0.2, 0)
          ctx.lineTo(0, logoSize * 0.25)
          ctx.lineTo(-logoSize * 0.2, 0)
          ctx.closePath()
          ctx.fillStyle = 'white'
          ctx.fill()
          break

        case 'BNB':
          // BNB logo - Yellow circle with BNB
          ctx.beginPath()
          ctx.arc(0, 0, logoSize / 2, 0, Math.PI * 2)
          ctx.fillStyle = '#F3BA2F'
          ctx.fill()
          
          ctx.fillStyle = 'white'
          ctx.font = `bold ${logoSize * 0.3}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('BNB', 0, 0)
          break
      }

      ctx.restore()
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update coin positions and rotations
      coinsRef.current.forEach((coin) => {
        coin.x += coin.vx
        coin.y += coin.vy
        coin.rotation += coin.rotationSpeed

        // Bounce off edges
        if (coin.x < coin.size) {
          coin.x = coin.size
          coin.vx = -coin.vx
        }
        if (coin.x > canvas.width - coin.size) {
          coin.x = canvas.width - coin.size
          coin.vx = -coin.vx
        }
        if (coin.y < coin.size) {
          coin.y = coin.size
          coin.vy = -coin.vy
        }
        if (coin.y > canvas.height - coin.size) {
          coin.y = canvas.height - coin.size
          coin.vy = -coin.vy
        }
      })

      // Update particle positions
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
      })

      // Rebuild connections periodically for large particles
      if (Math.random() < 0.01) {
        buildBlockchainConnections()
      }

      // Draw blockchain connections first (behind particles)
      particlesRef.current.forEach((particle, i) => {
        if (particle.isLarge) {
          particle.connections.forEach((connIndex) => {
            const connected = particlesRef.current[connIndex]
            if (connected) {
              ctx.beginPath()
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(connected.x, connected.y)
              ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 * particle.opacity})`
              ctx.lineWidth = 2
              ctx.stroke()
              
              // Draw small dots along the connection (blockchain blocks)
              const steps = 5
              for (let s = 1; s < steps; s++) {
                const t = s / steps
                const bx = particle.x + (connected.x - particle.x) * t
                const by = particle.y + (connected.y - particle.y) * t
                ctx.beginPath()
                ctx.arc(bx, by, 2, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(0, 255, 255, ${0.5})`
                ctx.fill()
              }
            }
          })
        }
      })

      // Draw coins first (behind particles)
      coinsRef.current.forEach((coin) => {
        ctx.save()
        ctx.translate(coin.x, coin.y)
        ctx.rotate((coin.rotation * Math.PI) / 180)

        // Outer glow
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coin.size)
        glowGradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)')
        glowGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.1)')
        glowGradient.addColorStop(1, 'rgba(0, 255, 255, 0)')
        
        ctx.beginPath()
        ctx.arc(0, 0, coin.size, 0, Math.PI * 2)
        ctx.fillStyle = glowGradient
        ctx.fill()

        // Coin border
        ctx.beginPath()
        ctx.arc(0, 0, coin.size, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)'
        ctx.lineWidth = 4
        ctx.stroke()

        // Coin background
        ctx.beginPath()
        ctx.arc(0, 0, coin.size - 2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(13, 27, 42, 0.8)'
        ctx.fill()

        // Draw logo
        drawCoinLogo(ctx, coin.logo, 0, 0, coin.size)

        ctx.restore()
      })

      // Draw particles
      particlesRef.current.forEach((particle) => {
        // Draw particle with glow effect for large ones
        if (particle.isLarge) {
          // Outer glow
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 2
          )
          gradient.addColorStop(0, `rgba(0, 255, 255, ${particle.opacity})`)
          gradient.addColorStop(0.5, `rgba(0, 255, 255, ${particle.opacity * 0.3})`)
          gradient.addColorStop(1, 'rgba(0, 255, 255, 0)')
          
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
        }
        
        // Main particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 255, 255, ${particle.opacity})`
        ctx.fill()
        
        // Inner highlight for large particles
        if (particle.isLarge) {
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.5})`
          ctx.fill()
        }

        // Draw connections to nearby small particles
        if (!particle.isLarge) {
          particlesRef.current.forEach((other) => {
            if (other !== particle && !other.isLarge) {
              const dx = particle.x - other.x
              const dy = particle.y - other.y
              const distance = Math.sqrt(dx * dx + dy * dy)

              if (distance < 80) {
                ctx.beginPath()
                ctx.moveTo(particle.x, particle.y)
                ctx.lineTo(other.x, other.y)
                ctx.strokeStyle = `rgba(0, 255, 255, ${0.1 * (1 - distance / 80)})`
                ctx.lineWidth = 0.5
                ctx.stroke()
              }
            }
          })
        }
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      const frameId = animationFrameRef.current
      if (frameId !== undefined) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
      style={{ zIndex: 0 }}
    />
  )
}
