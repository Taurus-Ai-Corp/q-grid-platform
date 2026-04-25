import { PrivacyContent, privacyMetadata } from '@taurus/legal-notices/privacy'

export const metadata = privacyMetadata

export default function PrivacyPage() {
  return (
    <div className="max-w-[800px] mx-auto px-6 pt-16 pb-24">
      <PrivacyContent />
    </div>
  )
}
