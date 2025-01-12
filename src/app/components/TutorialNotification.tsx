'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, ArrowLongLeftIcon, CheckCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

interface Props {
  show: boolean;
  onDismiss: () => void;
}

export default function TutorialNotification({ show, onDismiss }: Props) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
    }
  }, [show])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('hasSeenTutorial', 'true')
    onDismiss()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
          />
          
          {/* Notification */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-[calc(100%-2rem)] max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                     border border-gray-200 dark:border-gray-700 p-4 mx-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  Quick Tip
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-1 flex-wrap">
                  Swipe left 
                  <ArrowLongLeftIcon className="w-5 h-5 inline" />
                  on any Checklist Item
                  <CheckCircleIcon className="w-5 h-5 inline" />
                  to view 
                  <span className="text-blue-500 font-medium flex items-center gap-1">
                    Edit <PencilIcon className="w-4 h-4" />
                  </span>
                  and
                  <span className="text-red-500 font-medium flex items-center gap-1">
                    Delete <TrashIcon className="w-4 h-4" />
                  </span>
                  options.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <motion.div
                    animate={{
                      x: [-4, 4, -4],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeInOut"
                    }}
                    className="w-8 h-1 bg-blue-500 rounded-full"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Try it now!
                  </span>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                         transition-colors ml-4"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 