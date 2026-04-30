"use client"
import { motion } from 'framer-motion'

const MDiv: any = motion.div

export default function Showcase() {
  return (
    <MDiv className="max-w-6xl mx-auto px-6 py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <h3 className="text-2xl font-bold mb-6">Built-in widgets</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white/3 rounded-xl">
          <h4 className="font-semibold">Clock</h4>
          <p className="text-sm text-slate-300 mt-2">Timezones, 12/24 format and compact embeds.</p>
        </div>
        <div className="p-6 bg-white/3 rounded-xl">
          <h4 className="font-semibold">Quotes</h4>
          <p className="text-sm text-slate-300 mt-2">Sync with Notion or use local data sets.</p>
        </div>
        <div className="p-6 bg-white/3 rounded-xl">
          <h4 className="font-semibold">Progress</h4>
          <p className="text-sm text-slate-300 mt-2">Milestones, prefix/suffix and embed copier.</p>
        </div>
      </div>
    </MDiv>
  )
}
