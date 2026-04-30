"use client"
import { motion } from 'framer-motion'

export default function ModernFooter() {
  return (
    <motion.footer
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="w-full border-t border-white/5 mt-12 py-8"
    >
      <div className="max-w-7xl mx-auto px-6 text-sm text-slate-300 flex items-center justify-between">
        <div>© {new Date().getFullYear()} Notion Widgets — Built with care</div>
        <div className="flex gap-4">
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/terms" className="hover:underline">Terms</a>
        </div>
      </div>
    </motion.footer>
  )
}
