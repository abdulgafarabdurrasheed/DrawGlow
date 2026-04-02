import { useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setIsLoading] = useState(true)


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser)
        setIsLoading(false)
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error("Error signing in with Google", error);
    }
  };

  const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
    }
  };

  return { user, loading, loginWithGoogle, logout };
}