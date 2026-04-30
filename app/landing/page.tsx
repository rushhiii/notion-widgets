import ModernNavbar from '../../components/ui/ModernNavbar'
import Hero from '../../components/ui/Hero'
import Features from '../../components/ui/Features'
import Showcase from '../../components/ui/Showcase'
import ModernFooter from '../../components/ui/ModernFooter'

export const metadata = {
  title: 'Notion Widgets — Landing',
  description: 'Minimal embeddable Notion widgets — clocks, timers, quotes and more.'
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
      <main>
        <Hero />

        <Features />

        <Showcase />
      </main>
    </div>
  )
}
