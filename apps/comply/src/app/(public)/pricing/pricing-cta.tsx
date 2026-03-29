'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import type { PlanKey } from '@/lib/stripe'

interface PricingCTAProps {
  plan: Exclude<PlanKey, 'enterprise'>
  featured: boolean
  label: string
}

export function PricingCTA({ plan, featured, label }: PricingCTAProps) {
  const [loading, setLoading] = useState(false)
  const { isSignedIn } = useUser()
  const router = useRouter()

  async function handleClick() {
    // Not signed in — redirect to sign-up with redirect back to pricing
    if (!isSignedIn) {
      router.push('/sign-up?redirect_url=/pricing')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, annual: false }),
      })
      const data = await res.json() as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        // Billing not configured or error — fall back to sign-up
        router.push('/sign-up')
        return
      }

      window.location.href = data.url
    } catch {
      // Network error fallback
      router.push('/sign-up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={() => void handleClick()}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 h-11 px-6 text-sm font-semibold rounded-[var(--radius)] transition-colors disabled:opacity-50 ${
        featured
          ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)]'
          : 'border border-[var(--graphite-ghost)] text-[var(--graphite)] hover:bg-[var(--graphite-whisper)]'
      }`}
    >
      {loading ? 'Loading…' : label}
      <ChevronRight className="h-4 w-4" />
    </button>
  )
}
