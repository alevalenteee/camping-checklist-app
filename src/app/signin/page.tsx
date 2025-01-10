'use client'

import { signInWithGoogle } from '@/lib/firebase/firebaseUtils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
      router.push('/')
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Sign in error:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-space-grotesk font-bold text-green-800 dark:text-green-400 mb-8 text-center">
          Sign In
        </h1>
        
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 
                   bg-white/50 dark:bg-gray-700/50 rounded-lg 
                   text-gray-800 dark:text-gray-200 font-space-grotesk font-semibold
                   hover:bg-white/70 dark:hover:bg-gray-600/50 transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  )
} 