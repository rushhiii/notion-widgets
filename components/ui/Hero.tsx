"use client"
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 text-center">
      <motion.h1
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-5xl md:text-7xl font-extrabold leading-tight text-white"
      >
        Minimal, embeddable widgets for Notion and beyond.
      </motion.h1>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6 text-lg text-slate-300 max-w-3xl mx-auto">
        Turn Notion blocks into tiny interactive widgets — clocks, timers, quotes and more. Copy embeds, keep URL settings, and drop them into any page.
      </motion.p>

      <motion.div className="mt-10 flex items-center justify-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
        <a href="/quotes" className="px-6 py-3 rounded-full bg-amber-500 text-black font-semibold">Explore widgets</a>
        <a href="https://github.com/" className="px-6 py-3 rounded-full bg-white/5">View on GitHub</a>
      </motion.div>
    </section>
  )
}
