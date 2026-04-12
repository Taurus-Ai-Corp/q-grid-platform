import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe | null {
  const key = process.env['STRIPE_SECRET_KEY']
  if (!key) return null
  if (!_stripe) _stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia' })
  return _stripe
}

export const PLANS = {
  starter: {
    name: 'Starter',
    priceMonthly: 399_00, // cents
    currency: 'eur',
    features: ['1 user', '5 AI systems', 'EU AI Act assessment', 'Email support'],
  },
  growth: {
    name: 'Growth',
    priceMonthly: 899_00,
    currency: 'eur',
    features: ['5 users', 'Unlimited systems', 'All frameworks', 'Blockchain audit', 'API access'],
  },
  enterprise: {
    name: 'Enterprise',
    priceMonthly: null, // custom
    currency: 'eur',
    features: ['Unlimited', '8 engines', 'Sovereign AI', 'Dedicated CSM', 'SSO/SAML'],
  },
} as const

export type PlanKey = keyof typeof PLANS
