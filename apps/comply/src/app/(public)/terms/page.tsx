import { TermsContent, termsMetadata } from '@taurus/legal-notices/terms'

export const metadata = termsMetadata

export default function TermsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-6 pt-16 pb-24">
      <TermsContent />
    </div>
  )
}
