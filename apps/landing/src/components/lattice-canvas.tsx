'use client'

import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
}

export default function LatticeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animFrameId: number

    function resize() {
      if (!canvas || !ctx) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    const nodes: Node[] = []
    for (let i = 0; i < 50; i++) {
      nodes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      })
    }

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > window.innerWidth) n.vx *= -1
        if (n.y < 0 || n.y > window.innerHeight) n.vy *= -1
      }

      ctx.strokeStyle = 'rgba(0, 204, 170, 0.4)'
      ctx.lineWidth = 0.5

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const ni = nodes[i]
          const nj = nodes[j]
          if (!ni || !nj) continue
          const dx = ni.x - nj.x
          const dy = ni.y - nj.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 180) {
            ctx.globalAlpha = 1 - dist / 180
            ctx.beginPath()
            ctx.moveTo(ni.x, ni.y)
            ctx.lineTo(nj.x, nj.y)
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1
      ctx.fillStyle = 'rgba(0, 204, 170, 0.6)'
      for (const n of nodes) {
        ctx.beginPath()
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2)
        ctx.fill()
      }

      animFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animFrameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.25,
      }}
    />
  )
}
