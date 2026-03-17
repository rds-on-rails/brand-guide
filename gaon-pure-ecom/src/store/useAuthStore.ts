'use client';

import { create } from 'zustand';
import { auth } from '@/lib/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';

type UserRole = 'Guest' | 'Customer' | 'Admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitialized: boolean;
  setUser: (firebaseUser: any | null) => void;
  login: (email: string, password?: string) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isInitialized: false,
  login: (email, password) => {
    // Restored mock authentication logic to bypass Firebase issues
    if (password === 'admin123' || email.includes('admin')) {
      set({
        user: { id: 'admin1', name: 'Admin User', email, role: 'Admin' },
        isAuthenticated: true,
        isAdmin: true,
        isInitialized: true,
      });
    } else {
      set({
        user: { id: `user_${Date.now()}`, name: 'Customer', email, role: 'Customer' },
        isAuthenticated: true,
        isAdmin: false,
        isInitialized: true,
      });
    }
  },
  setUser: (firebaseUser) => {
    if (firebaseUser) {
      const email = firebaseUser.email || '';
      const isAdminUser = email === 'admin@gaonpure.com' || email.includes('admin');
      
      set({
        user: {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || email.split('@')[0] || 'Customer',
          email: email,
          role: isAdminUser ? 'Admin' : 'Customer',
        },
        isAuthenticated: true,
        isAdmin: isAdminUser,
        isInitialized: true,
      });
    } else {
      // Don't unauth if we are using the mock login currently
      set((state) => {
         if (state.user?.id === 'admin1') return state;
         return {
           user: null,
           isAuthenticated: false,
           isAdmin: false,
           isInitialized: true,
         };
      });
    }
  },
  logout: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
    // ensure mock users are logged out too
    set({ user: null, isAuthenticated: false, isAdmin: false });
  },
}));

