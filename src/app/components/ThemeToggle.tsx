'use client'

import { useTheme } from '@/app/contexts/ThemeContext'
import { useAuth } from '@/lib/hooks/useAuth'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { signOut, signInWithGoogle } from '@/lib/firebase/firebaseUtils'
import ProfileImage from './ProfileImage'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  isMobile?: boolean
  showThemeToggle?: boolean
  showProfileControls?: boolean
}

export default function ThemeToggle({ 
  isMobile = false, 
  showThemeToggle = true,
  showProfileControls = true 
}: Props) {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [isProfile, setIsProfile] = useState(false)

  const mobileClasses = "w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700/50"
  const desktopClasses = "px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg hover:shadow-xl"

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Sign in error:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'items-center gap-3'}`}>
      {showProfileControls && (user ? (
        <div className={`flex ${isMobile ? 'flex-col' : 'items-center gap-3'}`}>
          <button
            onClick={() => {
              setIsProfile(!isProfile)
              router.push(isProfile ? '/' : '/profile')
            }}
            className={`${isMobile ? mobileClasses : ''} hover:ring-2 hover:ring-green-400 rounded-full transition-all`}
          >
            <div className="flex items-center gap-2">
              <ProfileImage user={user} size="sm" />
              {isMobile && <span className="text-gray-700 dark:text-gray-300">Profile</span>}
            </div>
          </button>
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className={`${isMobile ? mobileClasses : desktopClasses}
                     text-red-600 dark:text-red-400
                     hover:bg-white/70 dark:hover:bg-gray-700/50 transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed
                     font-space-grotesk font-semibold`}
          >
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      ) : (
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className={`${isMobile ? mobileClasses : desktopClasses}
                   text-green-600 dark:text-green-400
                   hover:bg-white/70 dark:hover:bg-gray-700/50 transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed
                   font-space-grotesk font-semibold`}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      ))}
      {showThemeToggle && (
        <button
          onClick={toggleTheme}
          className={`${isMobile ? mobileClasses : 'p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg hover:shadow-xl'} 
                   transition-all`}
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <>
                <SunIcon className="w-6 h-6 text-yellow-400" />
                {isMobile && <span className="text-gray-700 dark:text-gray-300">Light Mode</span>}
              </>
            ) : (
              <>
                <MoonIcon className="w-6 h-6 text-gray-600" />
                {isMobile && <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>}
              </>
            )}
          </div>
        </button>
      )}
    </div>
  )
} 