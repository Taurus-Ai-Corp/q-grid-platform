'use client'

import { useEffect, useState } from 'react'
import {
  History,
  Server,
  ClipboardCheck,
  FileText,
  ShieldCheck,
  ShieldX,
  ShieldOff,
  Loader2,
  ExternalLink,
} from 'lucide-react'

interface AuditEvent {
  id: string
  userId: string
  entityType: 'system' | 'assessment' | 'report'
  entityId: string
  action: 'created' | 'updated' | 'completed' | 'generated' | 'signed'
  details: string
  pqcHash?: string
  pqcSignature?: string
  hederaTopicId?: string
  hederaTxId?: string
  hederaStatus: 'pending' | 'anchored' | 'failed' | 'skipped'
  createdAt: string
}

type FilterType = 'all' | 'system' | 'assessment' | 'report'

const ENTITY_CONFIG: Record<
  AuditEvent['entityType'],
  { icon: React.FC<{ className?: string }>; color: string; bg: string; label: string }
> = {
  system: {
    icon: Server,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    label: 'System',
  },
  assessment: {
    icon: ClipboardCheck,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    label: 'Assessment',
  },
  report: {
    icon: FileText,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    label: 'Report',
  },
}

function HederaBadge({ status, txId }: { status: AuditEvent['hederaStatus']; txId?: string }) {
  if (status === 'anchored') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
        <ShieldCheck className="h-3 w-3" />
        HCS anchored
        {txId && (
          <a
            href={`https://hashscan.io/mainnet/transaction/${txId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-0.5 hover:text-emerald-900"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
        <Loader2 className="h-3 w-3 animate-spin" />
        HCS pending
      </span>
    )
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
        <ShieldX className="h-3 w-3" />
        HCS failed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--graphite-light)] bg-[var(--graphite-whisper)] px-2 py-0.5 rounded-full">
      <ShieldOff className="h-3 w-3" />
      No HCS
    </span>
  )
}

function PqcBadge({ hash }: { hash?: string }) {
  if (!hash) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
      <ShieldCheck className="h-3 w-3" />
      ML-DSA-65
    </span>
  )
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All events' },
  { value: 'system', label: 'Systems' },
  { value: 'assessment', label: 'Assessments' },
  { value: 'report', label: 'Reports' },
]

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url =
      filter === 'all' ? '/api/audit' : `/api/audit?entityType=${filter}`

    setLoading(true)
    fetch(url)
      .then((res) => {
        if (!res.ok) return
        return res.json() as Promise<{ events: AuditEvent[] }>
      })
      .then((data) => {
        if (data) setEvents(data.events)
      })
      .catch(() => {
        // silently fail
      })
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--graphite)] mb-1">
            Audit Trail
          </h1>
          <p className="text-sm text-[var(--graphite-med)]">
            PQC-signed events anchored to Hedera Hashgraph (HCS)
          </p>
        </div>

        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          className="h-9 px-3 text-sm border border-[var(--graphite-ghost)] rounded-[var(--radius)] bg-white text-[var(--graphite)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-[var(--graphite-light)]">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm">Loading audit events…</span>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm p-12 text-center max-w-md mx-auto mt-8">
          <div className="w-12 h-12 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-4">
            <History className="h-6 w-6 text-[var(--accent)]" />
          </div>
          <h2 className="font-semibold text-[var(--graphite)] mb-2">No events yet</h2>
          <p className="text-sm text-[var(--graphite-med)]">
            Audit events will appear here when you register systems, complete assessments, or
            generate reports.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-[var(--graphite-ghost)]" />

          <ul className="space-y-4">
            {events.map((event) => {
              const cfg = ENTITY_CONFIG[event.entityType]
              const Icon = cfg.icon

              return (
                <li key={event.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${cfg.bg}`}
                  >
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white rounded-[var(--radius)] border border-[var(--graphite-ghost)] shadow-sm p-4 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <span
                          className={`inline-block text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full mr-2 ${cfg.bg} ${cfg.color}`}
                        >
                          {cfg.label}
                        </span>
                        <span className="text-sm font-medium text-[var(--graphite)] capitalize">
                          {event.action}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--graphite-light)] shrink-0 tabular-nums">
                        {relativeTime(event.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-[var(--graphite-med)] mb-3 leading-relaxed">
                      {event.details}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <PqcBadge hash={event.pqcHash} />
                      <HederaBadge status={event.hederaStatus} txId={event.hederaTxId} />
                    </div>

                    {event.pqcHash && (
                      <p className="mt-2 text-xs font-mono text-[var(--graphite-light)] truncate">
                        hash: {event.pqcHash.slice(0, 32)}…
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
