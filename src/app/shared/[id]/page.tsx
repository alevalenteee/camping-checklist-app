'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import { useAuth } from '@/lib/hooks/useAuth'
import { saveChecklist } from '@/lib/firebase/firebaseUtils'
import { Category } from '@/lib/types'

export default function SharedListPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [list, setList] = useState<{
    listName: string;
    categories: Category[];
    originalUserId: string;
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchSharedList = async () => {
      try {
        const docRef = doc(db, 'shared_lists', id as string)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          setError('Shared list not found')
          return
        }

        const data = docSnap.data()
        setList({
          listName: data.listName,
          categories: data.categories,
          originalUserId: data.originalUserId
        })
      } catch (error) {
        console.error('Error fetching shared list:', error)
        setError('Failed to load shared list')
      } finally {
        setLoading(false)
      }
    }

    fetchSharedList()
  }, [id])

  const handleSaveToMyLists = async () => {
    if (!user || !list) return
    
    try {
      setSaving(true)
      await saveChecklist(user.uid, list.listName, list.categories)
      setSaved(true)
    } catch (error) {
      console.error('Error saving list:', error)
      setError('Failed to save list to your profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-4">Loading shared list...</div>
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>
  }

  if (!list) {
    return <div className="p-4">List not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">{list.listName}</h1>
        
        {user && (
          <div className="mb-6">
            {saved ? (
              <div className="text-green-600 dark:text-green-400">
                ✓ Saved to your lists
              </div>
            ) : (
              <button
                onClick={handleSaveToMyLists}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save to My Lists'}
              </button>
            )}
          </div>
        )}

        <div className="space-y-6">
          {list.categories.map((category) => (
            <div key={category.id} className="border-t pt-4">
              <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
              <ul className="space-y-2">
                {category.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      readOnly
                      className="rounded border-gray-300"
                    />
                    <span>{item.text}</span>
                    {item.capacity && (
                      <span className="text-sm text-gray-500">
                        (Qty: {item.capacity})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 