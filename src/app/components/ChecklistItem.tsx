'use client'

import { CheckCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import type { ChecklistItem as ChecklistItemType } from '@/lib/types'
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

interface Props {
  item: ChecklistItemType
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function ChecklistItem({ item, onToggle, onEdit, onDelete }: Props) {
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const itemRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<number>(0)
  const x = useMotionValue(0)
  const buttonsX = useTransform(x, [-100, 0], [0, 150])
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle click outside to close actions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        x.set(0)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, x])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isAnimating) {
      touchStart.current = e.touches[0].clientX
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isAnimating) {
      const currentX = e.touches[0].clientX
      const diff = currentX - touchStart.current
      
      // If already open, only allow right swipes (positive diff)
      if (isOpen && diff > 0) {
        const newX = Math.min(diff - 100, 0) // Start from -100 (open state)
        x.set(newX)
      }
      // If closed, only allow left swipes (negative diff)
      else if (!isOpen && diff < 0) {
        const newX = Math.max(diff, -100)
        x.set(newX)
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isAnimating) {
      const currentX = e.changedTouches[0].clientX
      const diff = currentX - touchStart.current
      const threshold = 50

      if (isOpen) {
        // If swiping right when open
        const shouldClose = diff > threshold
        if (shouldClose) {
          setIsOpen(false)
          x.set(0)
        } else {
          x.set(-100) // Snap back to open position
        }
      } else {
        // If swiping left when closed
        const shouldOpen = -diff > threshold
        setIsOpen(shouldOpen)
        x.set(shouldOpen ? -100 : 0)
      }
    }
  }

  const getCapacityColor = (capacity: number) => {
    if (capacity <= 25) return 'bg-red-500 dark:bg-red-400'
    if (capacity <= 74) return 'bg-yellow-500 dark:bg-yellow-400'
    return 'bg-green-500 dark:bg-green-400'
  }

  const getCapacityTextColor = (capacity: number) => {
    if (capacity <= 25) return 'text-red-600 dark:text-red-400'
    if (capacity <= 74) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const handleAction = async (action: 'edit' | 'delete') => {
    setIsAnimating(true)
    setIsOpen(false)
    x.set(0)
    
    await new Promise(resolve => setTimeout(resolve, 200))
    
    if (action === 'edit') {
      onEdit()
    } else {
      onDelete()
    }
    
    setIsAnimating(false)
  }

  const handleItemClick = (e: React.MouseEvent) => {
    // If clicking the item while open, close it without toggling
    if (isOpen) {
      e.preventDefault()
      setIsOpen(false)
      x.set(0)
      return
    }
    // Otherwise toggle the item as normal
    onToggle()
  }

  return (
    <div className="relative overflow-hidden" ref={itemRef}>
      {/* Background layer for swipe actions on mobile */}
      {isMobile && (
        <motion.div 
          className="absolute inset-y-0 right-0 flex items-center z-20"
          style={{ x: buttonsX }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); handleAction('edit'); }}
            className="h-full px-4 bg-blue-500 text-white font-semibold flex items-center
                     rounded-l-lg"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleAction('delete'); }}
            className="h-full px-4 bg-red-500 text-white font-semibold flex items-center
                     rounded-r-lg"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </motion.div>
      )}
      
      {/* Main item content */}
      <div
        className={`relative bg-white/50 dark:bg-gray-800/50 z-10 outline-none`}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
      >
        <div 
          onClick={handleItemClick}
          className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg cursor-pointer
                    active:bg-white/30 dark:active:bg-gray-800/30 outline-none"
        >
          <CheckCircleIcon 
            className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors
                     ${item.checked ? 'text-green-500' : 'text-gray-300 group-hover:text-gray-400'}`}
          />
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <span className={`font-inter flex-grow truncate outline-none
                         ${item.checked ? 'text-green-500 dark:text-green-400 line-through' : 
                                        'text-gray-700 dark:text-gray-300'}`}>
              {item.text}
            </span>
            {typeof item.capacity === 'number' && (
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <div className="w-16 sm:w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${getCapacityColor(item.capacity)}`}
                    style={{ width: `${item.capacity}%` }}
                  />
                </div>
                <span className={`text-xs sm:text-sm font-semibold min-w-[40px] text-right
                              ${getCapacityTextColor(item.capacity)}`}>
                  {item.capacity}%
                </span>
              </div>
            )}
          </div>
          
          {/* Desktop action buttons */}
          {!isMobile && (
            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 
                         transition-colors active:scale-95 outline-none"
              >
                <PencilIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 
                         transition-colors active:scale-95 outline-none"
              >
                <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 