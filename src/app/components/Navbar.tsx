'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/hooks/useAuth'
import { signOut } from '@/lib/firebase/firebaseUtils'
import imageLoader from '@/app/lib/imageLoader'

export default function Navbar() {
  const { user } = useAuth()

  return (
    <nav className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/"
              className="text-green-800 dark:text-green-400 font-space-grotesk font-bold"
            >
              FULLY LOADED
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                >
                  My Lists
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                >
                  Sign Out
                </button>
                {user.photoURL && (
                  <Image
                    loader={imageLoader}
                    src={user.photoURL}
                    alt={user.displayName || 'Profile'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
              </>
            ) : (
              <Link
                href="/signin"
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-500"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 