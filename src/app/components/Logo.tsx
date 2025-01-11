'use client'

import Link from 'next/link'

export default function Logo() {
  return (
    <div>
      <Link href="/" className="text-2xl xs:text-3xl md:text-4xl font-space-grotesk font-bold text-green-800 dark:text-green-400 tracking-wider whitespace-nowrap hover:opacity-80 transition-opacity">
        FULLY LOADED
      </Link>
    </div>
  )
} 