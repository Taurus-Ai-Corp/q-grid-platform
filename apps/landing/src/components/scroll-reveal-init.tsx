'use client'

import { useEffect } from 'react'

/**
 * Initializes IntersectionObserver for scroll-triggered entrance animations.
 * Targets all elements with the `.reveal` or `.reveal-hero` class and adds
 * `.is-visible` when they enter the viewport (threshold: 15%).
 *
 * CSS transitions defined in globals.css handle the actual animation.
 */
export default function ScrollRevealInit() {
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal, .reveal-hero')
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            // Once revealed, stop observing — animation is one-shot
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    for (const target of targets) {
      observer.observe(target)
    }

    return () => observer.disconnect()
  }, [])

  return null
}
