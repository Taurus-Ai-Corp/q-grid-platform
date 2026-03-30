import Nav from '@/components/nav'
import Hero from '@/components/hero'
import ProofBar from '@/components/proof-bar'
import GeoSelector from '@/components/geo-selector'
import Differentiators from '@/components/differentiators'
import CompetitiveTable from '@/components/competitive-table'
import AgentsSection from '@/components/agents-section'
import FrameworkReference from '@/components/framework-reference'
import CtaSection from '@/components/cta-section'
import Footer from '@/components/footer'
import LatticeCanvas from '@/components/lattice-canvas'
import MicroDots from '@/components/micro-dots'
import ScrollRevealInit from '@/components/scroll-reveal-init'

export default function Home() {
  return (
    <main>
      <LatticeCanvas />
      <MicroDots />
      <ScrollRevealInit />
      <Nav />
      <Hero />
      {/* Organic divider: hero -> proof bar */}
      <div className="section-divider section-divider--dark-to-deep" aria-hidden="true" />
      <ProofBar />
      {/* Organic divider: proof bar -> differentiators */}
      <div className="section-divider section-divider--deep-to-dark" aria-hidden="true" />
      <Differentiators />
      {/* Organic divider: differentiators -> competitive table */}
      <div className="section-divider section-divider--dark-to-deep" aria-hidden="true" />
      <CompetitiveTable />
      {/* Organic divider: competitive table -> agents */}
      <div className="section-divider section-divider--deep-to-dark" aria-hidden="true" />
      <AgentsSection />
      {/* Organic divider: agents -> frameworks */}
      <div className="section-divider section-divider--dark-to-deep" aria-hidden="true" />
      <FrameworkReference />
      {/* Organic divider: frameworks -> geo */}
      <div className="section-divider section-divider--deep-to-dark" aria-hidden="true" />
      <GeoSelector />
      {/* Organic divider: geo -> cta */}
      <div className="section-divider section-divider--dark-to-deep" aria-hidden="true" />
      <CtaSection />
      <Footer />
    </main>
  )
}
