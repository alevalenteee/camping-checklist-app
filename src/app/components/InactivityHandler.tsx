'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useInactivityTimeout } from '@/lib/hooks/useInactivityTimeout';

export default function InactivityHandler({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Call the hook unconditionally with the user
  useInactivityTimeout(user);
  
  return <>{children}</>;
} 