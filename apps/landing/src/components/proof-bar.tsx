const STATS = [
  { number: '45', unit: 'Minutes', label: 'to First Assessment' },
  { number: '37', unit: 'AI Agents', label: 'Deployed' },
  { number: '14', unit: 'Compliance', label: 'Frameworks' },
  { number: '80%', unit: 'Reduction', label: 'in GRC Overhead' },
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
