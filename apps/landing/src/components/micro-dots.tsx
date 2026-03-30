'use client'

/**
 * Floating micro-dots — subtle ambient particles scattered across the page.
 * CSS-only animations defined in globals.css.
 * Positioned at strategic vertical intervals to eliminate dead zones.
 */

const DOT_POSITIONS = [
  // Scattered across the viewport at different vertical positions
  { top: '8%', left: '12%', size: 2, delay: '0s' },
  { top: '15%', right: '18%', size: 1.5, delay: '2s' },
  { top: '22%', left: '85%', size: 2, delay: '4s' },
  { top: '28%', left: '5%', size: 1.5, delay: '1s' },
  { top: '35%', right: '8%', size: 2, delay: '3s' },
  { top: '42%', left: '92%', size: 1.5, delay: '5s' },
  { top: '48%', left: '3%', size: 2, delay: '0.5s' },
  { top: '55%', right: '12%', size: 1.5, delay: '2.5s' },
  { top: '62%', left: '88%', size: 2, delay: '4.5s' },
  { top: '68%', left: '7%', size: 1.5, delay: '1.5s' },
  { top: '75%', right: '6%', size: 2, delay: '3.5s' },
  { top: '82%', left: '15%', size: 1.5, delay: '0.8s' },
  { top: '88%', right: '20%', size: 2, delay: '2.8s' },
  { top: '93%', left: '90%', size: 1.5, delay: '4.2s' },
]

export default function MicroDots() {
  return (
    <div className="micro-dots" aria-hidden="true">
      {DOT_POSITIONS.map((dot, i) => (
        <span
          key={i}
          className="micro-dot"
          style={{
            top: dot.top,
            left: 'left' in dot ? dot.left : undefined,
            right: 'right' in dot ? dot.right : undefined,
            width: dot.size,
            height: dot.size,
            animationDelay: dot.delay,
          }}
        />
      ))}
    </div>
  )
}
