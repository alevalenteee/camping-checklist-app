'use client'

import { useState, useRef, useEffect } from 'react'
import { Bars3Icon, XMarkIcon, HomeIcon } from '@heroicons/react/24/outline'
import { useTheme } from '@/app/contexts/ThemeContext'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { signInWithGoogle, signOut } from '@/lib/firebase/firebaseUtils'
import Image from 'next/image'

export default function MenuToggle() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
      setIsOpen(false)
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await signOut()
      setIsOpen(false)
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg bg-white/50 dark:bg-gray-800/50
                   backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
      >
        <Bars3Icon className={`w-6 h-6 ${
          theme === 'dark' ? 'text-green-400' : 'text-gray-600'
        }`} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-xl 
                       w-[90%] max-w-sm mx-4 p-6 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-space-grotesk font-semibold text-green-800 dark:text-green-400">
                Menu
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 
                         dark:hover:text-gray-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              {user ? (
                <>
                  {pathname === '/profile' && (
                    <button
                      onClick={() => {
                        router.push('/')
                        setIsOpen(false)
                      }}
                      className="w-full py-3 px-4 bg-white/50 dark:bg-gray-700/50 
                               rounded-lg text-green-800 dark:text-green-400
                               font-space-grotesk font-semibold
                               hover:bg-white/70 dark:hover:bg-gray-600/50 
                               transition-all text-center
                               flex items-center justify-center gap-2"
                    >
                      <HomeIcon className="w-5 h-5" />
                      Home
                    </button>
                  )}
                  <button
                    onClick={() => {
                      router.push('/profile')
                      setIsOpen(false)
                    }}
                    className="w-full py-3 px-4 bg-white/50 dark:bg-gray-700/50 
                             rounded-lg text-green-800 dark:text-green-400
                             font-space-grotesk font-semibold
                             hover:bg-white/70 dark:hover:bg-gray-600/50 
                             transition-all text-center"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-white/50 dark:bg-gray-700/50 
                             rounded-lg text-red-600 dark:text-red-400
                             font-space-grotesk font-semibold
                             hover:bg-white/70 dark:hover:bg-gray-600/50 
                             transition-all text-center
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Signing out...' : 'Sign Out'}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-white/50 dark:bg-gray-700/50 
                           rounded-lg text-green-800 dark:text-green-400
                           font-space-grotesk font-semibold
                           hover:bg-white/70 dark:hover:bg-gray-600/50 
                           transition-all flex items-center justify-center gap-3"
                >
                  <Image
                    src="/google-icon.svg"
                    alt="Google"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  {isLoading ? 'Signing in...' : 'Continue with Google'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 