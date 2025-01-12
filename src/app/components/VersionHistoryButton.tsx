'use client'

import { BellIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { LATEST_VERSION } from '@/lib/versionHistory'

interface Props {
  onShowUpdate: () => void
}

export default function VersionHistoryButton({ onShowUpdate }: Props) {
  return (
    <button
      onClick={onShowUpdate}
      className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100
                transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                flex items-center gap-2"
      title="View Latest Updates"
    >
      <BellIcon className="w-5 h-5" />
      <span className="text-xs font-semibold hidden sm:inline">v{LATEST_VERSION}</span>
    </button>
  )
} 