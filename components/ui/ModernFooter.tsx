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
      className="w-full border-t border-white/5 bg-gradient-to-t from-slate-950/50 to-transparent mt-24 py-12"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="font-bold text-white mb-4">Notion Widgets</h4>
            <p className="text-sm text-slate-400">Minimal, embeddable widgets for Notion and beyond.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link href="/landing" className="text-slate-400 hover:text-white transition-colors">Home</Link>
              <Link href="/clock" className="block text-slate-400 hover:text-white transition-colors">Widgets</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Social</h4>
            <a href="https://github.com/rushhiii/notion-widgets" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 text-sm text-slate-400 flex flex-col md:flex-row items-center justify-between">
          <div>© {new Date().getFullYear()} Notion Widgets. Built with care.</div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </MFooter>
  )
}
