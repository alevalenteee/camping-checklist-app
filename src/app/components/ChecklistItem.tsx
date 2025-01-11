'use client'

import { CheckCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import type { ChecklistItem as ChecklistItemType } from '@/lib/types'
import NewItemModal from './NewItemModal'
import ConfirmationModal from './ConfirmationModal'

interface Props {
  item: ChecklistItemType
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function ChecklistItem({ item, onToggle, onEdit, onDelete }: Props) {
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

  return (
    <div className="flex items-center gap-2 sm:gap-3 group p-1.5 sm:p-2 rounded-lg
                    transition-all duration-300 hover:bg-white dark:hover:bg-gray-700">
      <div onClick={onToggle} className="flex items-center gap-2 sm:gap-3 flex-1 cursor-pointer">
        <CheckCircleIcon 
          className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors
                     ${item.checked ? 'text-green-500' : 'text-gray-300 group-hover:text-gray-400'}`}
        />
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <span className={`font-inter flex-grow truncate
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
      </div>
      
      <style jsx>{`
        @media (hover: hover) {
          .action-buttons {
            opacity: 0;
          }
          .group:hover .action-buttons {
            opacity: 1;
          }
        }
      `}</style>
      
      <div className="action-buttons flex gap-1 sm:gap-2 flex-shrink-0 transition-opacity duration-200">
        <button
          onClick={onEdit}
          className="p-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 
                   transition-colors active:scale-95"
        >
          <PencilIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 
                   transition-colors active:scale-95"
        >
          <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  )
} 