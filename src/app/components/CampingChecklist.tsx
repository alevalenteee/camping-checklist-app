'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon, BookmarkIcon, DocumentPlusIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { ChecklistItem, Category } from '@/app/types'
import ChecklistCategory from '@/app/components/ChecklistCategory'
import NewItemModal from './NewItemModal'
import SaveListModal from './SaveListModal'
import ConfirmationModal from './ConfirmationModal'
import { useAuth } from '@/lib/contexts/AuthContext'
import { saveChecklist, checkListExists, deleteChecklist } from '@/lib/firebase/firebaseUtils'
import { useRouter } from 'next/navigation'

const EmptyState = () => (
  <div className="text-center py-12">
    <h2 className="text-xl font-space-grotesk font-semibold text-green-800 dark:text-green-400 mb-4">
      Welcome to Fully Loaded!
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-8">
      Get started by clicking &quot;Add Category&quot; below to create your first camping checklist.
      You can add items to each category and save your list for future trips.
    </p>
  </div>
)

const SignInPrompt = () => {
  const router = useRouter()
  
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-space-grotesk font-semibold text-green-800 dark:text-green-400 mb-4">
        Sign In to Create Lists
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Sign in with Google to create and save your camping checklists
      </p>
      <button
        onClick={() => router.push('/signin')}
        className="px-6 py-3 bg-white/50 dark:bg-gray-700/50 rounded-lg 
                 text-green-800 dark:text-green-400 font-space-grotesk font-semibold
                 hover:bg-white/70 dark:hover:bg-gray-600/50 transition-all"
      >
        Sign In
      </button>
    </div>
  )
}

export default function CampingChecklist() {
  const [listName, setListName] = useState<string>(() => {
    // Check for saved list name in localStorage
    const savedName = localStorage.getItem('savedListName')
    if (savedName) {
      localStorage.removeItem('savedListName') // Clear after loading
      return savedName
    }
    return 'Camping Checklist'
  })

  const [categories, setCategories] = useState<Category[]>(() => {
    // Check for saved categories in localStorage
    const saved = localStorage.getItem('savedCategories')
    if (saved) {
      localStorage.removeItem('savedCategories') // Clear after loading
      return JSON.parse(saved)
    }
    // Return empty array if no saved categories
    return []
  })

  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setError] = useState('')
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [isConfirmOverwriteOpen, setIsConfirmOverwriteOpen] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [pendingSaveName, setPendingSaveName] = useState('')
  const { user } = useAuth()
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [originalState, setOriginalState] = useState<{
    name: string;
    categories: Category[];
  } | null>(null);

  // Function to check if there are unsaved changes
  const hasUnsavedChanges = (): boolean => {
    if (!originalState) return true;
    
    // Check if name has changed
    if (originalState.name !== listName) return true;
    
    // Check if categories length has changed
    if (originalState.categories.length !== categories.length) return true;
    
    // Deep comparison of categories and their items
    return JSON.stringify(originalState.categories) !== JSON.stringify(categories);
  };

  // Update original state when list is loaded or saved
  const updateOriginalState = useCallback(() => {
    setOriginalState({
      name: listName,
      categories: JSON.parse(JSON.stringify(categories)) // Deep copy
    });
  }, [categories, listName]);

  const resetList = () => {
    setCategories([])
    setListName('Camping Checklist')
  }

  const handleSaveList = async (name: string) => {
    if (!user) return
    try {
      setIsSaving(true)
      setError('')
      // Check if list exists
      const exists = await checkListExists(user.uid, name)
      if (exists) {
        setError(`A list named "${name}" already exists. Please choose a different name.`)
        return
      }
      await saveChecklist(user.uid, name, categories)
      setListName(name)
      setIsSaveModalOpen(false)
      // Update original state after successful save
      updateOriginalState()
      // Show success alert
      setShowSuccessAlert(true)
      // Hide after 3 seconds
      setTimeout(() => setShowSuccessAlert(false), 3000)
    } catch (error) {
      console.error('Error saving list:', error)
      setError('Failed to save list. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleItem = (categoryId: string, itemId: string) => {
    // First update the UI immediately for responsiveness
    setCategories(categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: category.items.map(item => 
            item.id === itemId ? { ...item, checked: !item.checked } : item
          )
        }
      }
      return category
    }))
  }

  const addCategory = (name: string) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
      items: []
    }
    setCategories([...categories, newCategory])
    setIsNewCategoryModalOpen(false)
  }

  const editCategory = (categoryId: string, newName: string) => {
    setCategories(categories.map(category =>
      category.id === categoryId ? { ...category, name: newName } : category
    ))
  }

  const deleteCategory = (categoryId: string) => {
    setCategories(categories.filter(category => category.id !== categoryId))
  }

  const addItem = (categoryId: string, text: string, capacity?: number) => {
    setCategories(categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: [...category.items, { 
            id: `item-${Date.now()}`, 
            text, 
            checked: false,
            ...(capacity !== undefined ? { capacity } : {})
          }]
        }
      }
      return category
    }))
  }

  const editItem = (categoryId: string, itemId: string, newText: string, newCapacity?: number) => {
    setCategories(categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: category.items.map(item =>
            item.id === itemId ? { 
              ...item, 
              text: newText,
              ...(newCapacity !== undefined ? { capacity: newCapacity } : { capacity: undefined })
            } : item
          )
        }
      }
      return category
    }))
  }

  const deleteItem = (categoryId: string, itemId: string) => {
    setCategories(categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: category.items.filter(item => item.id !== itemId)
        }
      }
      return category
    }))
  }

  const handleDeleteList = async () => {
    if (!user) return
    try {
      setIsSaving(true)
      setError('')
      await deleteChecklist(user.uid, listName)
      resetList()
      setIsConfirmDeleteOpen(false)
    } catch (error) {
      console.error('Error deleting list:', error)
      setError('Failed to delete list. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const saveExistingList = async () => {
    if (!user) return
    try {
      setIsSaving(true)
      setError('')
      await saveChecklist(user.uid, listName, categories)
      // Update original state after successful save
      updateOriginalState()
      // Show success alert
      setShowSuccessAlert(true)
      // Hide after 3 seconds
      setTimeout(() => setShowSuccessAlert(false), 3000)
    } catch (error) {
      console.error('Error saving list:', error)
      setError('Failed to save list. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Initialize original state when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && listName !== 'Camping Checklist') {
      updateOriginalState();
    }
  }, [categories.length, listName, updateOriginalState]); // Dependencies are now properly memoized

  return (
    <div className="space-y-4 sm:space-y-6 bg-white/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg
                   dark:bg-gray-800/50 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-lg font-space-grotesk font-semibold text-green-800 dark:text-green-400">
          {listName}
        </h2>
        {user && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={resetList}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/50 dark:bg-gray-800/50
                       backdrop-blur-sm rounded-lg text-green-800 dark:text-green-400
                       hover:bg-green-50 dark:hover:bg-gray-700/50 transition-all
                       font-space-grotesk font-semibold text-sm sm:text-base
                       shadow-lg hover:shadow-xl flex-1 sm:flex-auto justify-center"
            >
              <DocumentPlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>New List</span>
            </button>
            {listName !== 'Camping Checklist' && (
              <button
                onClick={() => setIsConfirmDeleteOpen(true)}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/50 dark:bg-gray-800/50
                         backdrop-blur-sm rounded-lg text-red-600 dark:text-red-400
                         hover:bg-red-50 dark:hover:bg-gray-700/50 transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed
                         font-space-grotesk font-semibold text-sm sm:text-base
                         shadow-lg hover:shadow-xl flex-1 sm:flex-auto justify-center"
              >
                <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Delete</span>
              </button>
            )}
            <button
              onClick={listName === 'Camping Checklist' ? () => setIsSaveModalOpen(true) : saveExistingList}
              disabled={isSaving || !hasUnsavedChanges()}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/50 dark:bg-gray-800/50
                       backdrop-blur-sm rounded-lg text-green-800 dark:text-green-400
                       hover:bg-green-50 dark:hover:bg-gray-700/50 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed
                       font-space-grotesk font-semibold text-sm sm:text-base
                       shadow-lg hover:shadow-xl flex-1 sm:flex-auto justify-center"
            >
              <BookmarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>
                {isSaving ? 'Saving...' : hasUnsavedChanges() ? 'Save Changes' : 'No Changes'}
              </span>
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 
                     text-green-700 dark:text-green-400 rounded-lg"
          >
            <span>List Saved</span>
            <CheckCircleIcon className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>

      {saveError && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 
                     dark:text-red-400 rounded-lg">
          {saveError}
        </div>
      )}

      {!user ? (
        <SignInPrompt />
      ) : categories.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {categories.map(category => (
            <ChecklistCategory 
              key={category.id}
              category={category}
              onToggleItem={toggleItem}
              onEditCategory={editCategory}
              onDeleteCategory={deleteCategory}
              onAddItem={addItem}
              onEditItem={editItem}
              onDeleteItem={deleteItem}
            />
          ))}
        </>
      )}
      
      {user && (
        <button 
          onClick={() => setIsNewCategoryModalOpen(true)}
          className="w-full p-3 sm:p-4 border-2 border-dashed border-green-300 rounded-lg
                     text-green-800 dark:text-green-400 dark:border-green-700
                     hover:bg-green-50 dark:hover:bg-gray-700/50 transition-all hover:shadow-md
                     flex items-center justify-center gap-2 text-sm sm:text-base
                     font-space-grotesk font-semibold"
        >
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          Add Category
        </button>
      )}

      <NewItemModal 
        isOpen={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        onSubmit={addCategory}
        title="Add New Category"
        placeholder="Category name"
      />

      <SaveListModal
        isOpen={isSaveModalOpen}
        onClose={() => {
          setIsSaveModalOpen(false)
          setError('') // Clear any existing error when closing
        }}
        onSave={handleSaveList}
        error={saveError} // Pass error to SaveListModal
      />

      <ConfirmationModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDeleteList}
        title="Delete List?"
        message="Are you sure you want to delete this list? This action cannot be undone."
      />
    </div>
  )
} 