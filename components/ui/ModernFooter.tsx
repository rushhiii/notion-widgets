"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from 'framer-motion'
import Link from 'next/link'

const MFooter: any = motion.footer

export default function ModernFooter() {
  return (
    <MFooter
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="w-full border-t border-white/5 bg-gradient-to-t from-[#0b0814]/70 to-transparent mt-0 py-9"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 shrink-0 mb-4">
              <img
                src="/icons/web_logo.svg"
                alt="Viora logo"
                className="w-4 h-4 bg-transparent"
                draggable={false}
              />
              <span className="nav-brand font-semibold text-sm font-mono uppercase text-[var(--acc-muted)]">Viora</span>
            </Link>
            {/* <p className="text-sm text-slate-400">Minimal, embeddable widgets for Notion and beyond.</p> */}
          </div>
          <div>
            <h4 className="font-semibold text-[#625c5d] uppercase tracking-wide font-mono mb-4 text-xs">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link href="/" className="block text-[var(--acc-1)] hover:text-[var(--acc)] text-sm transition-colors">Home</Link>
              <Link href="/#widgets" className="block text-[var(--acc-1)] hover:text-[var(--acc)] text-sm transition-colors">Widgets</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-[#625c5d] uppercase tracking-wide font-mono mb-4 text-xs">Social</h4>
            <a href="https://github.com/rushhiii/notion-widgets" target="_blank" rel="noreferrer" className="block text-[var(--acc-1)] hover:text-[var(--acc)] text-sm transition-colors">GitHub</a>
          </div>
        </div>
        <div className="border-t font-mono border-white/5 pt-8 text-xs text-[#625c5d] flex flex-col md:flex-row items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <span>MIT</span>
            <span className="inline-block h-[2px] w-[2px] rounded-full bg-current" aria-hidden="true" />
            <span>{new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <p className="text-xs font-mono text-[#625c5d] sm:w-full sm:text-center">Minimal, embeddable widgets stack for Notion and beyond.</p>

            {/* <a href="#" className="hover:text-white transition-colors">Privacy</a> */}
            {/* <a href="#" className="hover:text-white transition-colors">Terms</a> */}
          </div>
        </div>
      </div>
    </MFooter>
  )
}
