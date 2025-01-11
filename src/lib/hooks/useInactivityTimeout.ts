import { useEffect, useRef, useCallback } from 'react';
import { signOut } from '../firebase/firebaseUtils';
import { User } from 'firebase/auth';

const INACTIVITY_TIMEOUT = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

export const useInactivityTimeout = (user: User | null) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (user) {
      timeoutRef.current = setTimeout(async () => {
        await signOut();
      }, INACTIVITY_TIMEOUT);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // List of events to track user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Reset timer on any user activity
    const handleActivity = () => {
      resetTimer();
    };

    // Set up initial timer
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [user, resetTimer]); // Added resetTimer to dependencies
}; 