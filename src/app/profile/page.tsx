'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Category } from '@/lib/types'
import { useAuth } from '@/lib/hooks/useAuth'
import { updateProfile } from '@/lib/firebase/firebaseUtils'
import SavedLists from '@/app/components/SavedLists'
import ProfileImage from '@/app/components/ProfileImage'

export default function Profile() {
  const { user } = useAuth()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/signin')
      return
    }
  }, [user, router])

  if (!user) return null

  const handleLoadList = (categories: Category[], name: string) => {
    // Save categories and name to localStorage
    localStorage.setItem('savedCategories', JSON.stringify(categories))
    localStorage.setItem('savedListName', name)
    // Redirect to home page
    router.push('/')
  }

  const handleImageChange = async (file: File) => {
    try {
      setIsUpdating(true)
      setError('')
      await updateProfile(user!, file)
    } catch (error) {
      console.error('Error updating profile image:', error)
      setError('Failed to update profile image')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 
                    dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-space-grotesk font-bold text-green-800 
                      dark:text-green-400 mb-6">
          My Profile
        </h1>

        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm 
                     rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <ProfileImage
              user={user}
              size="lg"
              editable
              onImageChange={handleImageChange}
            />
            <div>
              <h2 className="text-xl font-space-grotesk font-semibold 
                           text-gray-800 dark:text-gray-200">
                {user.displayName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {error}
                </p>
              )}
            </div>
          </div>

          <SavedLists onLoadList={handleLoadList} />
        </div>
      </div>
    </div>
  )
} 