"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'

const MDiv = motion.div

const widgets = [
  {
    name: 'Clock',
    icon: '🕐',
    description: 'Timezones, 12/24 format and compact embeds.',
    href: '/clock',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Quotes',
    icon: '💭',
    description: 'Sync with Notion or use local data sets.',
    href: '/quotes',
    color: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Progress',
    icon: '📊',
    description: 'Milestones, prefix/suffix and embed copier.',
    href: '/progress',
    color: 'from-green-500 to-emerald-500'
  },
  {
    name: 'D-Day',
    icon: '⏳',
    description: 'Countdown with days, weeks, months and more.',
    href: '/dday',
    color: 'from-orange-500 to-red-500'
  },
  {
    name: 'Weather',
    icon: '🌤️',
    description: 'Current conditions from OpenWeather API.',
    href: '/weather',
    color: 'from-sky-500 to-blue-500'
  },
  {
    name: 'Music Player',
    icon: '🎵',
    description: 'APlayer with Netease and Tencent support.',
    href: '/music-player',
    color: 'from-violet-500 to-purple-500'
  }
]

export default function Showcase() {
  return (
    <MDiv
      className="max-w-6xl mx-auto px-6 py-24 space-y-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-black text-white">Widget Gallery</h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">Six powerful widgets, endlessly customizable</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map((widget, i) => (
          <Link key={widget.name} href={widget.href}>
            <MDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
              className="p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/30 transition-all cursor-pointer group"
            >
              <div className={`text-5xl mb-4 group-hover:scale-110 transition-transform`}>{widget.icon}</div>
              <h3 className="font-bold text-xl text-white mb-2 group-hover:text-amber-300 transition-colors">{widget.name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{widget.description}</p>
              <div className="mt-4 flex items-center text-amber-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Try it →
              </div>
            </MDiv>
          </Link>
        ))}
      </div>
    </MDiv>
  )
}
