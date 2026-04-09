'use client'

import { useEffect, useRef } from 'react'

/**
 * Full-page animated lattice background — teal nodes connected by lines,
 * slowly drifting across the viewport. Visible on white backgrounds.
 * Mouse-reactive: nodes near cursor glow brighter and pull slightly toward it.
 */
export function BgAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    let animId: number
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // --- NODES ---
    const NODE_COUNT = 50
    const CONNECT_DIST = 180

    interface Node {
      x: number
      y: number
      vx: number
      vy: number
      r: number
      baseAlpha: number
    }

    const nodes: Node[] = []
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1 + 2, // 2-3px radius — subtle dots
        baseAlpha: Math.random() * 0.15 + 0.3, // 0.3 - 0.45 — subtle on cream
      })
    }

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update positions
      for (const node of nodes) {
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x < -20) node.x = canvas.width + 20
        if (node.x > canvas.width + 20) node.x = -20
        if (node.y < -20) node.y = canvas.height + 20
        if (node.y > canvas.height + 20) node.y = -20
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        const ni = nodes[i]!
        for (let j = i + 1; j < nodes.length; j++) {
          const nj = nodes[j]!
          const dx = ni.x - nj.x
          const dy = ni.y - nj.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.2
            ctx.beginPath()
            ctx.moveTo(ni.x, ni.y)
            ctx.lineTo(nj.x, nj.y)
            ctx.strokeStyle = `rgba(0, 142, 138, ${alpha})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      // Draw nodes — solid dots, no glow
      for (const node of nodes) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 142, 138, ${node.baseAlpha})`
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    // Scroll reveal observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} id="lattice-bg" />
}
