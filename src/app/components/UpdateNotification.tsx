'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { versionHistory, LATEST_VERSION } from '@/lib/versionHistory'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  forceShow?: boolean;
  onClose?: () => void;
}

export default function UpdateNotification({ forceShow, onClose }: Props) {
  const [isVisible, setIsVisible] = useState(false)
  const latestUpdate = versionHistory[0]

  useEffect(() => {
    if (forceShow) {
      setIsVisible(true)
      return
    }
    // Check if this version has been dismissed
    const dismissedVersions = JSON.parse(localStorage.getItem('dismissedVersions') || '[]')
    if (!dismissedVersions.includes(LATEST_VERSION)) {
      setIsVisible(true)
    }
  }, [forceShow])

  const handleDismiss = () => {
    setIsVisible(false)
    if (!forceShow) {
      // Only store in localStorage if not forced
      const dismissedVersions = JSON.parse(localStorage.getItem('dismissedVersions') || '[]')
      dismissedVersions.push(LATEST_VERSION)
      localStorage.setItem('dismissedVersions', JSON.stringify(dismissedVersions))
    }
    onClose?.()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-4 right-4 max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                     border border-gray-200 dark:border-gray-700 p-4 z-50"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Version {latestUpdate.version}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {latestUpdate.date}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                       transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3">
            <ul className="space-y-2">
              {latestUpdate.features.map((feature, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                  <span className="mr-2">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 