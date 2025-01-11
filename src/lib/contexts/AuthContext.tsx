"use client";

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { auth } from '../firebase/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { signInWithGoogle, signOut } from '../firebase/firebaseUtils'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<User>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => { throw new Error('Not implemented') },
  signOut: async () => { throw new Error('Not implemented') }
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error('Auth state change error:', error)
      setLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
