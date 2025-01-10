'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (text: string, capacity?: number) => void
  title: string
  placeholder: string
  initialValue?: string
  initialCapacity?: number
  showCapacity?: boolean
}

export default function NewItemModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  title,
  placeholder,
  initialValue = '',
  initialCapacity,
  showCapacity = false
}: Props) {
  const [text, setText] = useState(initialValue)
  const [trackCapacity, setTrackCapacity] = useState(initialCapacity !== undefined)
  const [capacity, setCapacity] = useState(initialCapacity ?? 100)

  // Update state when props change
  useEffect(() => {
    if (isOpen) {
      setText(initialValue)
      setTrackCapacity(initialCapacity !== undefined)
      setCapacity(initialCapacity ?? 100)
    }
  }, [isOpen, initialValue, initialCapacity])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onSubmit(text.trim(), trackCapacity ? capacity : undefined)
      setText('')
      setCapacity(100)
      setTrackCapacity(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md
                     transition-colors duration-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-space-grotesk font-semibold text-gray-800 dark:text-green-400">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                className="w-full p-3 border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500
                         text-gray-800 dark:text-white 
                         dark:border-gray-600 dark:bg-gray-700/50
                         placeholder-gray-400 dark:placeholder-gray-500
                         text-lg"
                autoFocus
              />

              {showCapacity && (
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={trackCapacity}
                      onChange={(e) => setTrackCapacity(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 
                               text-green-600 focus:ring-green-500
                               dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="text-gray-700 dark:text-gray-300 text-lg">
                      Track capacity for this item
                    </span>
                  </label>

                  {trackCapacity && (
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                          Capacity (%)
                        </span>
                        <span className="text-green-600 dark:text-green-400 text-lg font-semibold">
                          {capacity}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={capacity}
                        onChange={(e) => setCapacity(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none 
                                 cursor-pointer dark:bg-gray-700
                                 accent-green-500"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 
                           hover:bg-gray-100 dark:hover:bg-gray-700 
                           rounded-lg transition-colors text-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg
                           hover:bg-green-700 transition-colors text-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 