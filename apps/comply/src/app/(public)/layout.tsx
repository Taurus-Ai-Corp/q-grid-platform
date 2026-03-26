import { PublicNav } from '@/components/public-nav'
import { PublicFooter } from '@/components/public-footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      <main className="pt-16">{children}</main>
      <PublicFooter />
    </>
  )
}
