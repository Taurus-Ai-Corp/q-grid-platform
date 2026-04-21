import Nav from '@/components/nav'
import Footer from '@/components/footer'
import { PrivacyContent, privacyMetadata } from '@taurus/legal-notices/privacy'

export const metadata = privacyMetadata

export default function PrivacyPage() {
  return (
    <div className="bg-[var(--bone)] text-[var(--graphite)] min-h-screen">
      <Nav />
      <main className="max-w-[800px] mx-auto px-6 pt-32 pb-24">
        <PrivacyContent />
      </main>
      <Footer />
    </div>
  )
}
