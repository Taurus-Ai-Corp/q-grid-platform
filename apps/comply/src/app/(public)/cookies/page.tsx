import { CookiesContent, cookiesMetadata } from '@taurus/legal-notices/cookies'

export const metadata = cookiesMetadata

export default function CookiesPage() {
  return (
    <div className="max-w-[800px] mx-auto px-6 pt-16 pb-24">
      <CookiesContent />
    </div>
  )
}
