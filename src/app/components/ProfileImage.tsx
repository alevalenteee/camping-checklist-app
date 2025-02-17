'use client'

import { useState, useMemo, useEffect } from 'react'
import { User } from 'firebase/auth'
import Image from 'next/image'
import { CameraIcon } from '@heroicons/react/24/outline'
import imageLoader from '@/app/lib/imageLoader'

interface Props {
  user: User
  size?: 'sm' | 'lg'
  editable?: boolean
  onImageChange?: (file: File) => Promise<void>
}

export default function ProfileImage({ user, size = 'sm', editable = false, onImageChange }: Props) {
  const [isHovering, setIsHovering] = useState(false)
  const [imageLoadError, setImageLoadError] = useState(false)

  // Reset error state when photoURL changes
  useEffect(() => {
    if (user?.photoURL) {
      setImageLoadError(false)
    }
  }, [user?.photoURL])

  const getColorScheme = useMemo(() => {
    if (!user?.email) return { bg: 'bg-gray-500', text: 'text-white' }
    
    // Map letters to different color schemes
    const colorSchemes = [
      { bg: 'bg-green-600 dark:bg-green-700', text: 'text-white' },
      { bg: 'bg-blue-600 dark:bg-blue-700', text: 'text-white' },
      { bg: 'bg-purple-600 dark:bg-purple-700', text: 'text-white' },
      { bg: 'bg-yellow-500 dark:bg-yellow-600', text: 'text-white' },
      { bg: 'bg-red-600 dark:bg-red-700', text: 'text-white' },
      { bg: 'bg-indigo-600 dark:bg-indigo-700', text: 'text-white' },
      { bg: 'bg-pink-600 dark:bg-pink-700', text: 'text-white' },
      { bg: 'bg-teal-600 dark:bg-teal-700', text: 'text-white' },
    ]
    
    // Use the first letter's character code to pick a color scheme
    const charCode = user.email.charCodeAt(0)
    const index = charCode % colorSchemes.length
    return colorSchemes[index]
  }, [user?.email])

  const getInitial = () => {
    if (!user?.email) {
      console.warn('No email found for user:', user)
      return '?'
    }
    return user.email.charAt(0).toUpperCase()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageChange) {
      setImageLoadError(false)
      await onImageChange(file)
    }
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    lg: 'w-24 h-24'
  }

  const sizePx = {
    sm: 32,
    lg: 96
  }

  const renderInitial = () => (
    <div className={`${sizeClasses[size]} rounded-full ${getColorScheme.bg}
                    flex items-center justify-center ${getColorScheme.text} 
                    font-space-grotesk font-semibold`}>
      {getInitial()}
    </div>
  )

  return (
    <div className="relative">
      {user?.photoURL && !imageLoadError ? (
        <div className="relative">
          <Image
            src={user.photoURL}
            alt={user.displayName || 'Profile'}
            width={sizePx[size]}
            height={sizePx[size]}
            className={`rounded-full object-cover ${sizeClasses[size]}`}
            onError={(e) => {
              console.warn('Error loading profile image, falling back to initial. URL:', user.photoURL);
              setImageLoadError(true);
            }}
            unoptimized={true}
            priority={true}
          />
        </div>
      ) : renderInitial()}
    </div>
  )
} 