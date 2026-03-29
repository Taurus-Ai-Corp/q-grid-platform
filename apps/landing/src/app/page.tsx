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

export default function Home() {
  return (
    <main>
      <LatticeCanvas />
      <Nav />
      <Hero />
      <ProofBar />
      <Differentiators />
      <CompetitiveTable />
      <AgentsSection />
      <FrameworkReference />
      <GeoSelector />
      <CtaSection />
      <Footer />
    </main>
  )
}
