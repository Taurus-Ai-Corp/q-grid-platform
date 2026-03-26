import * as React from 'react'
import { cn } from '../lib/utils.js'

interface QGridLogoProps {
  /** 'icon' = lattice only, 'mark' = lattice + wordmark, 'wordmark' = text only */
  variant?: 'icon' | 'mark' | 'wordmark'
  /** Override teal accent color */
  color?: string
  /** Size in px — controls the lattice icon height */
  size?: number
  /** Show "Quantum Grid Compliance" subtitle (only in 'mark' variant) */
  showSubtitle?: boolean
  className?: string
}

/**
 * Q-GRID Comply logo — lattice node cluster forming a Q shape.
 *
 * Uses 7 interconnected nodes in a crystallographic lattice pattern
 * with an asymmetric tail that forms the letter Q. Designed for
 * dark (#0B0E14) and light backgrounds.
 */
export function QGridLogo({
  variant = 'mark',
  color = '#00CCAA',
  size = 32,
  showSubtitle = false,
  className,
}: QGridLogoProps) {
  const lattice = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Glow filter for nodes */}
      <defs>
        <filter id="qgrid-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/*
        Node positions (lattice grid forming Q shape):
        A(20,12) --- B(44,12)
        |  \      /  |
        C(12,32)  D(32,28)  E(52,32)
        |  /      \  |
        F(20,52) --- G(44,52)
                        \
                         H(56,60) ← Q tail
      */}

      {/* Lattice connection lines */}
      <g stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
        {/* Outer ring */}
        <line x1="20" y1="12" x2="44" y2="12" />
        <line x1="20" y1="12" x2="12" y2="32" />
        <line x1="44" y1="12" x2="52" y2="32" />
        <line x1="12" y1="32" x2="20" y2="52" />
        <line x1="52" y1="32" x2="44" y2="52" />
        <line x1="20" y1="52" x2="44" y2="52" />

        {/* Inner cross-connections (lattice diagonals) */}
        <line x1="20" y1="12" x2="32" y2="28" />
        <line x1="44" y1="12" x2="32" y2="28" />
        <line x1="12" y1="32" x2="32" y2="28" />
        <line x1="52" y1="32" x2="32" y2="28" />
        <line x1="32" y1="28" x2="20" y2="52" />
        <line x1="32" y1="28" x2="44" y2="52" />

        {/* Q tail — the signature asymmetric break */}
        <line x1="44" y1="52" x2="56" y2="60" />
      </g>

      {/* Lattice nodes */}
      <g filter="url(#qgrid-glow)">
        {/* Top row */}
        <circle cx="20" cy="12" r="3" fill={color} />
        <circle cx="44" cy="12" r="3" fill={color} />

        {/* Middle row */}
        <circle cx="12" cy="32" r="3" fill={color} />
        <circle cx="32" cy="28" r="4" fill={color} /> {/* Center node — larger */}
        <circle cx="52" cy="32" r="3" fill={color} />

        {/* Bottom row */}
        <circle cx="20" cy="52" r="3" fill={color} />
        <circle cx="44" cy="52" r="3" fill={color} />

        {/* Q tail node */}
        <circle cx="56" cy="60" r="2.5" fill={color} />
      </g>
    </svg>
  )

  if (variant === 'icon') {
    return (
      <span className={cn('inline-flex items-center', className)} aria-label="Q-GRID Comply">
        {lattice}
      </span>
    )
  }

  if (variant === 'wordmark') {
    return (
      <span
        className={cn(
          'inline-flex flex-col font-[var(--font-heading)] tracking-tight',
          className,
        )}
        aria-label="Q-GRID Comply"
      >
        <span className="flex items-baseline gap-0.5">
          <span className="font-bold" style={{ color }}>Q</span>
          <span className="font-bold">-GRID</span>
          <span className="text-[var(--graphite-faint)] mx-0.5">/</span>
          <span className="font-bold" style={{ color }}>COMPLY</span>
        </span>
        {showSubtitle && (
          <span className="text-[0.55em] font-normal tracking-[0.15em] text-[var(--graphite-light)] uppercase">
            Quantum Grid Compliance
          </span>
        )}
      </span>
    )
  }

  // variant === 'mark' — full logo: lattice + wordmark
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2.5',
        className,
      )}
      aria-label="Q-GRID Comply"
    >
      {lattice}
      <span className="inline-flex flex-col font-[var(--font-heading)] tracking-tight leading-tight">
        <span className="flex items-baseline gap-0.5">
          <span className="font-bold" style={{ color }}>Q</span>
          <span className="font-bold">-GRID</span>
          <span className="text-[var(--graphite-faint)] mx-0.5">/</span>
          <span className="font-bold" style={{ color }}>COMPLY</span>
        </span>
        {showSubtitle && (
          <span className="text-[0.55em] font-normal tracking-[0.15em] text-[var(--graphite-light)] uppercase">
            Quantum Grid Compliance
          </span>
        )}
      </span>
    </span>
  )
}
