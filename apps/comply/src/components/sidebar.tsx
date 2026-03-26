'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import {
  LayoutDashboard,
  Server,
  ClipboardCheck,
  FileText,
  Shield,
  History,
  GraduationCap,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { JurisdictionBadge } from './jurisdiction-badge'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Systems', href: '/dashboard/systems', icon: Server },
  { label: 'Assessments', href: '/dashboard/assessments', icon: ClipboardCheck },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  { label: 'Security', href: '/dashboard/security', icon: Shield },
  { label: 'Audit Trail', href: '/dashboard/audit', icon: History },
  { label: 'Education', href: '/dashboard/education', icon: GraduationCap },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()

  return (
    <aside className="fixed top-0 left-0 h-screen w-[260px] bg-white border-r border-[var(--graphite-ghost)] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-[var(--graphite-ghost)]">
        <div className="flex items-center gap-2">
          <span className="font-[var(--font-heading)] text-base font-bold text-[var(--graphite)]">
            Q-GRID <span className="text-[var(--graphite-faint)]">/</span> <span className="text-[var(--accent)]">COMPLY</span>
          </span>
          <JurisdictionBadge jurisdiction="eu" size="sm" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[var(--accent-light)] text-[var(--accent)]'
                      : 'text-[var(--graphite-med)] hover:bg-[var(--graphite-whisper)] hover:text-[var(--graphite)]',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Divider */}
        <div className="my-3 border-t border-[var(--graphite-ghost)]" />

        <ul>
          <li>
            <Link
              href="/dashboard/settings"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors',
                pathname.startsWith('/dashboard/settings')
                  ? 'bg-[var(--accent-light)] text-[var(--accent)]'
                  : 'text-[var(--graphite-med)] hover:bg-[var(--graphite-whisper)] hover:text-[var(--graphite)]',
              )}
            >
              <Settings className="h-4 w-4 shrink-0" />
              Settings
            </Link>
          </li>
        </ul>
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-[var(--graphite-ghost)] flex items-center gap-3">
        <UserButton />
        {user && (
          <span className="text-xs text-[var(--graphite-med)] truncate">
            {user.primaryEmailAddress?.emailAddress}
          </span>
        )}
      </div>
    </aside>
  )
}
