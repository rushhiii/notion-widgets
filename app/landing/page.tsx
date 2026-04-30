"use client"
import ModernNavbar from '../../components/ui/ModernNavbar'
import Hero from '../../components/ui/Hero'
import ModernFooter from '../../components/ui/ModernFooter'

export const metadata = {
  title: 'Notion Widgets — Landing',
  description: 'Minimal embeddable Notion widgets — clocks, timers, quotes and more.'
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900/95 to-black text-white">
      <ModernNavbar />

      <main className="pt-10">
        <Hero />

        <section className="max-w-6xl mx-auto px-6 mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white/3 rounded-xl">
            <h3 className="font-semibold text-lg">Embeddable</h3>
            <p className="mt-2 text-sm text-slate-200">Copy embed links with all URL settings preserved.</p>
          </div>
          <div className="p-6 bg-white/3 rounded-xl">
            <h3 className="font-semibold text-lg">Accessible</h3>
            <p className="mt-2 text-sm text-slate-200">Small, high-contrast components that work anywhere.</p>
          </div>
          <div className="p-6 bg-white/3 rounded-xl">
            <h3 className="font-semibold text-lg">Customizable</h3>
            <p className="mt-2 text-sm text-slate-200">Theme and URL params keep widget appearance consistent.</p>
          </div>
        </section>
      </main>

      <ModernFooter />
    </div>
  )
}
