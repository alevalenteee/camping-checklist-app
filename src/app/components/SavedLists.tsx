'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowPathIcon, 
  TrashIcon, 
  PencilIcon,
  FolderIcon,
  CheckCircleIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import { SavedChecklist } from '@/lib/types'
import { useAuth } from '@/lib/hooks/useAuth'
import { 
  getUserChecklists, 
  deleteChecklist, 
  updateChecklist, 
  checkListExists,
  saveChecklist 
} from '@/lib/firebase/firebaseUtils'
import ConfirmationModal from './ConfirmationModal'
import NewItemModal from './NewItemModal'
import Toast from './Toast'

interface Props {
  onLoadList: (categories: SavedChecklist['categories'], name: string) => void
}

export default function SavedLists({ onLoadList }: Props) {
  const { user } = useAuth()
  const [lists, setLists] = useState<SavedChecklist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingList, setEditingList] = useState<SavedChecklist | null>(null)
  const [isConfirmOverwriteOpen, setIsConfirmOverwriteOpen] = useState(false)
  const [pendingRename, setPendingRename] = useState<{
    list: SavedChecklist;
    newName: string;
  } | null>(null)
  const [sharing, setSharing] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      // Show "X hours ago" for timestamps less than 24 hours old
      const hours = Math.floor(diffInHours)
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    } else if (diffInHours < 48) {
      // Show "Yesterday at HH:MM AM/PM" for timestamps between 24-48 hours
      return `Yesterday at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`
    } else {
      // Show full date and time for older timestamps
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      if (!user) return
      const listToDelete = lists.find(list => list.id === deleteId)
      if (!listToDelete) return
      await deleteChecklist(user.uid, listToDelete.name)
      setLists(lists.filter(list => list.id !== deleteId))
    } catch (error) {
      console.error('Error deleting list:', error)
      setError('Failed to delete list')
    } finally {
      setDeleteId(null)
    }
  }

  const handleRename = async (newName: string) => {
    if (!editingList || !user) return
    try {
      const exists = await checkListExists(user.uid, newName)
      if (exists && newName !== editingList.name) {
        setPendingRename({ list: editingList, newName })
        setIsConfirmOverwriteOpen(true)
        return
      }
      
      // First save the new list
      await saveChecklist(user.uid, newName, editingList.categories)
      // Then delete the old list if the names are different
      if (newName !== editingList.name) {
        await deleteChecklist(user.uid, editingList.name)
      }
      
      setLists(lists.map(list => 
        list.id === editingList.id 
          ? { ...list, name: newName }
          : list
      ))
      setEditingList(null)
    } catch (error) {
      console.error('Error renaming list:', error)
      setError('Failed to rename list')
    } finally {
      setPendingRename(null)
      setIsConfirmOverwriteOpen(false)
    }
  }

  const handleConfirmOverwrite = async () => {
    if (!pendingRename || !user) return
    try {
      const { list, newName } = pendingRename
      // First save the new list
      await saveChecklist(user.uid, newName, list.categories)
      // Then delete the old list if the names are different
      if (newName !== list.name) {
        await deleteChecklist(user.uid, list.name)
      }
      
      setLists(lists.map(l => 
        l.id === list.id 
          ? { ...l, name: newName }
          : l
      ))
      setEditingList(null)
    } catch (error) {
      console.error('Error overwriting list:', error)
      setError('Failed to rename list')
    } finally {
      setPendingRename(null)
      setIsConfirmOverwriteOpen(false)
    }
  }

  const handleShare = async (list: SavedChecklist) => {
    if (!user) return
    try {
      setSharing(list.id)
      const response = await fetch('/api/lists/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          listName: list.name,
          categories: list.categories,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to share list')
      }

      const { shareUrl } = await response.json()
      setShareUrl(shareUrl)

      // Copy to clipboard and show toast
      await navigator.clipboard.writeText(shareUrl)
      setShowToast(true)
    } catch (error) {
      console.error('Error sharing list:', error)
      setError('Failed to share list')
    } finally {
      setSharing(null)
    }
  }

  useEffect(() => {
    if (!user) return

    const fetchLists = async () => {
      try {
        setLoading(true)
        const fetchedLists = await getUserChecklists(user.uid)
        console.log('Fetched lists:', fetchedLists)
        setLists(fetchedLists as SavedChecklist[])
      } catch (error) {
        console.error('Error fetching lists:', error)
        setError('Failed to load your saved lists')
      } finally {
        setLoading(false)
      }
    }

    fetchLists()
  }, [user])

  // Debug render
  console.log('Current lists:', lists)

  if (!user) return null

  if (loading) {
    return (
      <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
        Loading your lists...
      </div>
    )
  }

  if (lists.length === 0) {
    return (
      <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
        You haven&apos;t saved any lists yet.
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-space-grotesk font-semibold text-green-800 
                     dark:text-green-400 mb-4">
        Saved Lists
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 
                       dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {lists.map(list => (
          <div
            key={list.id}
            onClick={() => onLoadList(list.categories, list.name)}
            className="group bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm 
                     rounded-lg p-4 shadow-md hover:shadow-lg transition-all
                     cursor-pointer relative"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="font-space-grotesk font-semibold text-gray-800 
                             dark:text-gray-200">
                  {editingList?.id === list.id ? (
                    <input
                      type="text"
                      defaultValue={list.name}
                      onBlur={(e) => handleRename(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white dark:bg-gray-700 px-2 py-1 rounded"
                      autoFocus
                    />
                  ) : (
                    list.name
                  )}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated {formatDate(list.updatedAt)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShare(list)
                  }}
                  className={`p-2 text-green-600 dark:text-green-400
                           hover:bg-white/50 dark:hover:bg-gray-700/50 
                           rounded-lg transition-all
                           ${sharing === list.id ? 'animate-pulse' : ''}`}
                  title="Share list"
                  disabled={sharing === list.id}
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingList(list)
                  }}
                  className="p-2 text-green-600 dark:text-green-400
                           hover:bg-white/50 dark:hover:bg-gray-700/50 
                           rounded-lg transition-all"
                  title="Rename list"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onLoadList(list.categories, list.name)
                  }}
                  className="p-2 text-green-600 dark:text-green-400 
                           hover:bg-white/50 dark:hover:bg-gray-700/50 
                           rounded-lg transition-all"
                  title="Load list"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteId(list.id)
                  }}
                  className="p-2 text-red-600 dark:text-red-400 
                           hover:bg-white/50 dark:hover:bg-gray-700/50 
                           rounded-lg transition-all"
                  title="Delete list"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete List"
        message="Are you sure you want to delete this list? This action cannot be undone."
      />

      <NewItemModal
        isOpen={!!editingList}
        onClose={() => setEditingList(null)}
        onSubmit={handleRename}
        title="Rename List"
        placeholder="Enter new name"
        initialValue={editingList?.name}
      />

      <ConfirmationModal
        isOpen={isConfirmOverwriteOpen}
        onClose={() => {
          setIsConfirmOverwriteOpen(false)
          setPendingRename(null)
        }}
        onConfirm={handleConfirmOverwrite}
        title="Overwrite List?"
        message={`A list named "${pendingRename?.newName}" already exists. Do you want to overwrite it?`}
      />

      <Toast 
        message="Share link copied to clipboard!"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
} 