"use client"
import { motion } from 'framer-motion'

const MSection = motion.section
const MDiv = motion.div

const featureCards = [
  {
    icon: '📋',
    title: 'Copy-friendly embeds',
    description: 'Embed links keep all URL params so your saved embeds look the same everywhere.'
  },
  {
    icon: '⚡',
    title: 'Lightweight',
    description: 'Minimal JS footprint and focused features keep pages fast.'
  },
  {
    icon: '♿',
    title: 'Accessible',
    description: 'High contrast and keyboard-friendly controls out of the box.'
  },
  {
    icon: '🎨',
    title: 'Customizable',
    description: 'Theme and URL params keep widget appearance consistent.'
  }
]

export default function Features() {
  return (
    <MSection
      className="max-w-6xl mx-auto px-6 py-24 space-y-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-black text-white">Why you&apos;ll love it</h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">Built for simplicity, designed for everyone</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featureCards.map((card, i) => (
          <MDiv
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.08)' }}
            className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="text-4xl mb-4">{card.icon}</div>
            <h3 className="font-bold text-lg text-white mb-2">{card.title}</h3>
            <p className="text-slate-400 text-sm">{card.description}</p>
          </MDiv>
        ))}
      </div>
    </MSection>
  )
}
