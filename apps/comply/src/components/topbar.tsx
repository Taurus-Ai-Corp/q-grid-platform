'use client'

import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { JurisdictionBadge } from './jurisdiction-badge'

const PATH_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/systems': 'AI Systems',
  '/dashboard/assessments': 'Assessments',
  '/dashboard/reports': 'Reports',
  '/dashboard/security': 'Security',
  '/dashboard/audit': 'Audit Trail',
  '/dashboard/education': 'Education',
  '/dashboard/settings': 'Settings',
}

export function Topbar() {
  const pathname = usePathname()
  const pageTitle = PATH_LABELS[pathname] ?? 'Dashboard'

  return (
    <header className="h-14 bg-white border-b border-[var(--graphite-ghost)] flex items-center justify-between px-6 shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[var(--graphite-light)]">GRIDERA Comply</span>
        <span className="text-[var(--graphite-ghost)]">/</span>
        <span className="font-medium text-[var(--graphite)]">{pageTitle}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <JurisdictionBadge jurisdiction="eu" size="sm" />
        <UserButton />
      </div>
    </header>
  )
}
