import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { User } from 'firebase/auth';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, signInWithGoogle, signOut } = context;

  return {
    user: user as User | null,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user
  };
} 