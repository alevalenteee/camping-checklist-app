'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircleIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import NewItemModal from './NewItemModal'
import ConfirmationModal from './ConfirmationModal'
import type { Category, ChecklistItem as ChecklistItemType } from '../../lib/types'
import ChecklistItem from './ChecklistItem'

interface Props {
  category: Category
  onToggleItem: (categoryId: string, itemId: string) => void
  onEditCategory: (categoryId: string, newName: string) => void
  onDeleteCategory: (categoryId: string) => void
  onAddItem: (categoryId: string, text: string, capacity?: number) => void
  onEditItem: (categoryId: string, itemId: string, newText: string, capacity?: number) => void
  onDeleteItem: (categoryId: string, itemId: string) => void
}

export default function ChecklistCategory({ 
  category, 
  onToggleItem,
  onEditCategory,
  onDeleteCategory,
  onAddItem,
  onEditItem,
  onDeleteItem
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(category.name)
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleEditSave = () => {
    onEditCategory(category.id, editedName)
    setIsEditing(false)
  }

  const handleAddItem = (text: string, capacity?: number) => {
    onAddItem(category.id, text, capacity)
    setIsNewItemModalOpen(false)
  }

  const handleEditItem = (text: string, capacity?: number) => {
    if (editingItemId) {
      onEditItem(category.id, editingItemId, text, capacity)
      setEditingItemId(null)
    }
  }

  const sortedItems = [...category.items].sort((a, b) => {
    if (a.checked === b.checked) return 0;
    return a.checked ? 1 : -1;
  });

  // Calculate item positions for animation
  const itemHeight = 40; // Reduced height for more consistent spacing
  const getItemStyle = (index: number, checked: boolean, isAnimating: boolean) => {
    return {
      position: isAnimating ? 'absolute' : 'relative' as const,
      width: '100%',
      zIndex: checked ? 0 : 1,
      y: index * itemHeight
    } as const;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-md p-4 sm:p-6 backdrop-blur-sm
                 transition-colors duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleEditSave}
            onKeyPress={(e) => e.key === 'Enter' && handleEditSave()}
            className="text-lg sm:text-xl font-space-grotesk font-semibold text-gray-800 dark:text-green-400 
                     bg-transparent border-b-2 border-green-300 focus:outline-none focus:border-green-500 w-full"
            autoFocus
          />
        ) : (
          <h2 className="text-lg sm:text-xl font-space-grotesk font-semibold text-green-800 dark:text-green-400">
            {category.name}
          </h2>
        )}
        <div className="flex gap-1 sm:gap-2 ml-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
          >
            <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
          >
            <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <div className="relative" style={{ height: `${sortedItems.length * itemHeight}px` }}>
        <AnimatePresence>
        {sortedItems.map((item: ChecklistItemType, index: number) => (
          <motion.div 
            key={item.id}
            initial={false}
            animate={getItemStyle(index, item.checked, true)}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.6
            }}
            className="absolute w-full"
          >
            <ChecklistItem
              item={item}
              onToggle={() => onToggleItem(category.id, item.id)}
              onEdit={() => setEditingItemId(item.id)}
              onDelete={() => onDeleteItem(category.id, item.id)}
            />
          </motion.div>
        ))}
        </AnimatePresence>
      </div>

      <button
        onClick={() => setIsNewItemModalOpen(true)}
        className="mt-4 w-full p-2 sm:p-3 border border-dashed border-green-800 rounded-lg
                   text-green-800 dark:text-green-400 dark:border-green-700
                   hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all
                   flex items-center justify-center gap-2 text-sm sm:text-base
                   font-space-grotesk font-semibold"
      >
        <PlusIcon className="w-4 h-4" />
        Add Item
      </button>

      <NewItemModal 
        isOpen={isNewItemModalOpen}
        onClose={() => setIsNewItemModalOpen(false)}
        onSubmit={handleAddItem}
        title="Add New Item"
        placeholder="Item name"
        showCapacity={true}
      />

      <NewItemModal 
        isOpen={!!editingItemId}
        onClose={() => setEditingItemId(null)}
        onSubmit={handleEditItem}
        title="Edit Item"
        placeholder="Item name"
        initialValue={editingItemId ? category.items.find((item: ChecklistItemType) => item.id === editingItemId)?.text || '' : ''}
        initialCapacity={editingItemId ? category.items.find((item: ChecklistItemType) => item.id === editingItemId)?.capacity : undefined}
        showCapacity={true}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => onDeleteCategory(category.id)}
        title="Delete Category"
        message={`Are you sure you want to delete "${category.name}" and all its items? This action cannot be undone.`}
      />
    </motion.div>
  )
} 