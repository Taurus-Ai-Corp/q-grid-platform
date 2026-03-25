export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <p className="font-mono text-xs text-[var(--accent)] uppercase tracking-widest mb-4">
          /// Quantum-Safe Compliance Infrastructure
        </p>
        <h1 className="font-heading text-5xl font-bold mb-4">
          Compliance-First
          <br />
          <span className="text-[var(--accent)]">Post-Quantum</span>
          <br />
          Cryptography
        </h1>
        <p className="text-[var(--graphite-med)] text-lg mb-8">
          Get quantum-safe in 45 minutes, not months.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/scan"
            className="bg-[var(--accent)] text-white px-6 py-3 font-semibold hover:bg-[var(--accent-dark)] transition-colors"
          >
            Free PQC Scan
          </a>
          <a
            href="#differentiators"
            className="border border-[var(--graphite-ghost)] px-6 py-3 font-semibold hover:bg-[var(--accent-glow)] transition-colors"
          >
            Why Q-Grid
          </a>
        </div>
      </div>
    </main>
  )
}
