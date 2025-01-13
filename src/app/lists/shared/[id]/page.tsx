'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Category } from '@/lib/types'
import { useAuth } from '@/lib/hooks/useAuth'
import { saveChecklist } from '@/lib/firebase/firebaseUtils'

interface SharedList {
  originalUserName: string
  originalListName: string
  categories: Category[]
}

export default function SharedListPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [sharedList, setSharedList] = useState<SharedList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchSharedList = async () => {
      try {
        const response = await fetch(`/api/lists/share?id=${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch shared list')
        }
        const data = await response.json()
        setSharedList(data)
      } catch (error) {
        console.error('Error fetching shared list:', error)
        setError('Failed to load the shared list')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSharedList()
    }
  }, [id])

  const saveToMyLists = async () => {
    if (!user || !sharedList) return
    
    try {
      setSaving(true)
      const listName = `${sharedList.originalListName} (from ${sharedList.originalUserName})`
      await saveChecklist(user.uid, listName, sharedList.categories)
      router.push('/')
    } catch (error) {
      console.error('Error saving shared list:', error)
      setError('Failed to save the list to your account')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading shared list...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (!sharedList) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">List not found</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {sharedList.originalListName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Shared by {sharedList.originalUserName}
          </p>
          
          <div className="space-y-6">
            {sharedList.categories.map((category) => (
              <div key={category.id} className="border-t pt-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  {category.name}
                </h2>
                <ul className="space-y-2">
                  {category.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center text-gray-700 dark:text-gray-300"
                    >
                      <span className="ml-2">{item.text}</span>
                      {item.capacity && (
                        <span className="ml-2 text-sm text-gray-500">
                          (Qty: {item.capacity})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveToMyLists}
              disabled={saving || !user}
              className={`px-4 py-2 bg-green-500 text-white rounded-lg 
                ${saving || !user 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-green-600'} 
                transition-colors`}
            >
              {saving ? 'Saving...' : 'Save to My Lists'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 