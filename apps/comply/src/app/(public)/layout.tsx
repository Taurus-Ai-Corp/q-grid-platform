import { PublicNav } from '@/components/public-nav'
import { PublicFooter } from '@/components/public-footer'
import { BgAnimation } from '@/components/bg-animation'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BgAnimation />
      <PublicNav />
      <main className="pt-16 relative z-[1]">{children}</main>
      <PublicFooter />
    </>
  )
}
