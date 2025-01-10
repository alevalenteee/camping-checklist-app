'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => void
  defaultName?: string
  error?: string
}

export default function SaveListModal({ 
  isOpen, 
  onClose, 
  onSave,
  defaultName = 'My Camping List',
  error
}: Props) {
  const [name, setName] = useState(defaultName)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSave(name.trim())
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-space-grotesk font-semibold text-gray-800 dark:text-green-400">
                Save Checklist
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 
                           dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter checklist name"
                className="w-full p-2 border border-gray-200 rounded-lg mb-4
                         focus:outline-none focus:ring-2 focus:ring-green-500
                         text-gray-800 dark:text-white 
                         dark:border-gray-600 dark:bg-gray-700/50
                         placeholder-gray-400 dark:placeholder-gray-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 
                           hover:bg-gray-100 dark:hover:bg-gray-700 
                           rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg
                           hover:bg-green-700 transition-colors"
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