"use client"
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import {
    ArrowUpRight
} from "lucide-react";

const MHeader = motion.header

const mobileMenuVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeInOut' as const },
  },
  visible: {
    opacity: 1,
    height: 'auto',
    y: 0,
    transition: {
      duration: 0.28,
      ease: 'easeOut' as const,
      when: 'beforeChildren',
      staggerChildren: 0.05,
    },
  },
}

const mobileMenuItemVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' as const },
  },
}

export default function ModernNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <MHeader
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      role="navigation"
      aria-label="Main navigation"
      className={`modern-navbar z-50 w-full ${isScrolled ? 'scrolled' : ''}`}
    >
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/icons/web_logo.svg"
            alt="Viora logo"
            className="w-5 h-5 bg-transparent"
            width={20}
            height={20}
            draggable={false}
          />
          <span className="nav-brand text-base text-white">Viora</span>
        </Link>

        {/* Center: Nav links (desktop) */}
        <nav className="hidden sm:flex items-center gap-8 justify-center flex-1">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/#widgets" className="nav-link">Widgets</Link>
        </nav>

        {/* Right: Buttons (desktop) */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <motion.a
            // whileHover={{ scale: 1.05 }}
            href="https://github.com/rushhiii/notion-widgets"
            target="_blank"
            rel="noreferrer"
            className="btn-github inline-flex items-center gap-2.5"
          >
            <FontAwesomeIcon icon={faGithub} className='w-3.5 h-3.5'/>
            {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path d="M237.9 461.4C237.9 463.4 235.6 465 232.7 465C229.4 465.3 227.1 463.7 227.1 461.4C227.1 459.4 229.4 457.8 232.3 457.8C235.3 457.5 237.9 459.1 237.9 461.4zM206.8 456.9C206.1 458.9 208.1 461.2 211.1 461.8C213.7 462.8 216.7 461.8 217.3 459.8C217.9 457.8 216 455.5 213 454.6C210.4 453.9 207.5 454.9 206.8 456.9zM251 455.2C248.1 455.9 246.1 457.8 246.4 460.1C246.7 462.1 249.3 463.4 252.3 462.7C255.2 462 257.2 460.1 256.9 458.1C256.6 456.2 253.9 454.9 251 455.2zM316.8 72C178.1 72 72 177.3 72 316C72 426.9 141.8 521.8 241.5 555.2C254.3 557.5 258.8 549.6 258.8 543.1C258.8 536.9 258.5 502.7 258.5 481.7C258.5 481.7 188.5 496.7 173.8 451.9C173.8 451.9 162.4 422.8 146 415.3C146 415.3 123.1 399.6 147.6 399.9C147.6 399.9 172.5 401.9 186.2 425.7C208.1 464.3 244.8 453.2 259.1 446.6C261.4 430.6 267.9 419.5 275.1 412.9C219.2 406.7 162.8 398.6 162.8 302.4C162.8 274.9 170.4 261.1 186.4 243.5C183.8 237 175.3 210.2 189 175.6C209.9 169.1 258 202.6 258 202.6C278 197 299.5 194.1 320.8 194.1C342.1 194.1 363.6 197 383.6 202.6C383.6 202.6 431.7 169 452.6 175.6C466.3 210.3 457.8 237 455.2 243.5C471.2 261.2 481 275 481 302.4C481 398.9 422.1 406.6 366.2 412.9C375.4 420.8 383.2 435.8 383.2 459.3C383.2 493 382.9 534.7 382.9 542.9C382.9 549.4 387.5 557.3 400.2 555C500.2 521.8 568 426.9 568 316C568 177.3 455.5 72 316.8 72zM169.2 416.9C167.9 417.9 168.2 420.2 169.9 422.1C171.5 423.7 173.8 424.4 175.1 423.1C176.4 422.1 176.1 419.8 174.4 417.9C172.8 416.3 170.5 415.6 169.2 416.9zM158.4 408.8C157.7 410.1 158.7 411.7 160.7 412.7C162.3 413.7 164.3 413.4 165 412C165.7 410.7 164.7 409.1 162.7 408.1C160.7 407.5 159.1 407.8 158.4 408.8zM190.8 444.4C189.2 445.7 189.8 448.7 192.1 450.6C194.4 452.9 197.3 453.2 198.6 451.6C199.9 450.3 199.3 447.3 197.3 445.4C195.1 443.1 192.1 442.8 190.8 444.4zM179.4 429.7C177.8 430.7 177.8 433.3 179.4 435.6C181 437.9 183.7 438.9 185 437.9C186.6 436.6 186.6 434 185 431.7C183.6 429.4 181 428.4 179.4 429.7z"/></svg> */}
            <span>GitHub</span>
          </motion.a>
          <motion.a
            // whileHover={{ scale: 1.05 }}
            href="#widgets"
            className="btn-primary inline-flex items-center gap-2"
          >
            <span>Explore</span>
                <ArrowUpRight className="w-4 h-4" />

            {/* <span className="text-sm">→</span> */}
          </motion.a>
        </div>

        {/* Right: Hamburger (mobile) */}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav-menu"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="sm:hidden ml-auto inline-flex flex-col justify-center items-center gap-1.5 w-10 h-10 rounded-md border border-white/20 text-white"
        >
          <span
            className={`block h-0.5 w-5 bg-current transition-transform duration-200 ${isMobileMenuOpen ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span
            className={`block h-0.5 w-5 bg-current transition-opacity duration-200 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}
          />
          <span
            className={`block h-0.5 w-5 bg-current transition-transform duration-200 ${isMobileMenuOpen ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-nav-menu"
            className="sm:hidden px-4 pb-4 overflow-hidden"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="mx-auto max-w-[1200px] rounded-lg border border-white/15 bg-black/35 p-4 backdrop-blur-sm">
              <motion.nav className="flex flex-col gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                <motion.div variants={mobileMenuItemVariants}>
                  <Link href="/" className="nav-link block w-full text-center py-2">Home</Link>
                </motion.div>
                <motion.div variants={mobileMenuItemVariants}>
                  <Link href="/#widgets" className="nav-link block w-full text-center py-2">Widgets</Link>
                </motion.div>
                <motion.div variants={mobileMenuItemVariants}>
                  <a
                    href="https://github.com/rushhiii/notion-widgets"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-github inline-flex w-full items-center justify-center gap-2.5"
                  >
                    <FontAwesomeIcon icon={faGithub} className='w-3.5 h-3.5'/>
                    <span>GitHub</span>
                  </a>
                </motion.div>
                <motion.div variants={mobileMenuItemVariants}>
                  <a href="#widgets" className="btn-primary inline-flex w-full items-center justify-center gap-2">
                    <span>Explore</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </motion.div>
              </motion.nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MHeader>
  )
}
