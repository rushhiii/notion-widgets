"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link'
import { motion } from 'framer-motion'

const MHeader: any = motion.header

export default function ModernNavbar() {
  return (
    <MHeader
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-white/5 bg-gradient-to-b from-slate-950/95 to-slate-950/80 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/20"
          >
            NW
          </motion.div>
          <span className="font-semibold text-base text-white group-hover:text-amber-400 transition-colors">Notion Widgets</span>
        </Link>

        <nav className="flex items-center gap-8">
          <Link href="/landing" className="text-sm text-slate-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-amber-400 after:transition-all after:duration-300 hover:after:w-full">Home</Link>
          <Link href="/clock" className="text-sm text-slate-300 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-amber-400 after:transition-all after:duration-300 hover:after:w-full">Widgets</Link>
          <motion.a
            whileHover={{ scale: 1.05 }}
            href="https://github.com/rushhiii/notion-widgets"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-white/10 text-sm text-white hover:bg-white/20 transition-colors border border-white/10"
          >
            GitHub
          </motion.a>
        </nav>
      </div>
    </MHeader>
  )
}
