import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { migrateChecklistsToNewStructure } from '@/lib/firebase/firebaseUtils'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'

export default function MigrationModal() {
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkMigrationStatus = async () => {
      if (!user) return

      // Check if user has already migrated
      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)
      const hasMigrated = userDoc.data()?.hasMigrated

      if (!hasMigrated) {
        setShowModal(true)
      }
    }

    checkMigrationStatus()
  }, [user])

  const handleMigration = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setStatus('idle')
      setMessage('')

      const result = await migrateChecklistsToNewStructure(user.uid)
      
      // Mark user as migrated
      const userRef = doc(db, 'users', user.uid)
      await setDoc(userRef, { hasMigrated: true }, { merge: true })

      setStatus('success')
      setMessage(`Successfully migrated ${result.migratedCount} lists`)
      
      // Close modal after success
      setTimeout(() => {
        setShowModal(false)
      }, 2000)
    } catch (error) {
      console.error('Migration error:', error)
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Migration failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!showModal) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Security Update Required
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Hi there! We&apos;ve updated our security protocol to better protect your data. 
              We need to quickly migrate your lists to work with these new security measures.
            </p>

            {status === 'success' && message && (
              <p className="mb-4 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-2 rounded">
                ✓ {message}
              </p>
            )}
            
            {status === 'error' && message && (
              <p className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2 rounded">
                ⚠ {message}
              </p>
            )}

            <button
              onClick={handleMigration}
              disabled={isLoading || status === 'success'}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400
                       text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isLoading ? 'Migrating...' : 'Run Data Migration'}
            </button>
            
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              This is a one-time process to ensure your lists work with our improved security system.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 