"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link'
import { motion } from 'framer-motion'

const MHeader: any = motion.header

export default function ModernNavbar() {
  return (
    <MHeader
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between"
    >
      <Link href="/" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold">NW</div>
        <span className="font-semibold text-lg">Notion Widgets</span>
      </Link>

      <nav className="flex items-center gap-6 text-sm text-slate-200">
        <Link href="/landing" className="hover:underline">Home</Link>
        <Link href="/clock" className="opacity-80 hover:opacity-100">Widgets</Link>
        <a href="https://github.com/" target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg bg-white/5">GitHub</a>
      </nav>
    </MHeader>
  )
}
