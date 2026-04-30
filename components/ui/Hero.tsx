"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from 'framer-motion'

const MHeading: any = motion.h1
const MP: any = motion.p
const MD: any = motion.div
const MDiv: any = motion.div

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8">
        <MDiv
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-sm font-medium text-amber-200 mb-6">
            ✨ Embeddable Notion Widgets
          </span>
        </MDiv>

        <MHeading
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="text-6xl md:text-7xl lg:text-8xl font-black leading-[1.15] text-white tracking-tight"
        >
          Minimal, embeddable{' '}
          <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-red-500 bg-clip-text text-transparent">widgets</span>
          {' '}for Notion and beyond.
        </MHeading>

        <MP
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Turn Notion blocks into tiny interactive widgets — clocks, timers, quotes and more. Copy embeds, keep URL settings, and drop them into any page.
        </MP>

        <MD
          className="flex items-center justify-center gap-4 pt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <motion.a
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(245, 158, 11, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            href="/quotes"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-base shadow-lg transition-all hover:shadow-xl"
          >
            Explore widgets →
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
            whileTap={{ scale: 0.95 }}
            href="https://github.com/rushhiii/notion-widgets"
            target="_blank"
            rel="noreferrer"
            className="px-8 py-4 rounded-full bg-white/10 text-white font-bold text-base border border-white/20 hover:border-white/40 transition-all"
          >
            View on GitHub
          </motion.a>
        </MD>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  )
}
