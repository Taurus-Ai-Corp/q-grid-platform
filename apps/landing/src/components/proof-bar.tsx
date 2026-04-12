const STATS = [
  { number: '< 1', unit: 'Minutes', label: 'to First PQC Scan' },
  { number: '8', unit: 'Compliance', label: 'Engines' },
  { number: '11', unit: 'Standards', label: 'Tracked' },
  { number: '5', unit: 'EU Regulations', label: 'Covered' },
]

export default function ProofBar() {
  return (
    <section className="py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 reveal-stagger">
          {STATS.map(({ number, unit, label }) => (
            <div key={unit} className="reveal text-center">
              <div
                className="font-mono font-light tracking-[-0.04em] leading-none text-[var(--accent)]"
                style={{ fontSize: 'clamp(36px, 4vw, 52px)' }}
              >
                {number}
              </div>
              <div className="font-[var(--font-heading)] font-semibold text-[var(--graphite)] mt-2 text-lg">
                {unit}
              </div>
              <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--graphite-med)] mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
