"use client"
import { motion } from 'framer-motion'

const MSection: any = motion.section

export default function Features() {
  return (
    <MSection className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <div className="space-y-6">
        <h2 className="text-3xl font-extrabold">Tiny, powerful widgets</h2>
        <p className="text-slate-300">Designed to be dropped into Notion or any page. Preserve query settings, theme, and embed behavior.</p>
        <div className="grid gap-4 mt-6">
          <div className="p-4 bg-white/3 rounded-lg">
            <h4 className="font-semibold">Copy-friendly embeds</h4>
            <p className="text-sm text-slate-300">Embed links keep all URL params so your saved embeds look the same everywhere.</p>
          </div>
          <div className="p-4 bg-white/3 rounded-lg">
            <h4 className="font-semibold">Lightweight</h4>
            <p className="text-sm text-slate-300">Minimal JS footprint and focused features keep pages fast.</p>
          </div>
          <div className="p-4 bg-white/3 rounded-lg">
            <h4 className="font-semibold">Accessible</h4>
            <p className="text-sm text-slate-300">High contrast and keyboard-friendly controls out of the box.</p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-purple-900/30 to-indigo-900/20 rounded-xl border border-white/5 flex items-center justify-center">
        <img src="/readme/hero_dashboard.png" alt="widgets preview" className="w-full h-auto rounded-md shadow-lg" />
      </div>
    </MSection>
  )
}
