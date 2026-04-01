export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bone)] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">{children}</div>
    </div>
  )
}
