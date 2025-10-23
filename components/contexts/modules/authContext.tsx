'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  AuthError,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { firebaseAuth, firestoreDB } from '@/utils/firebase/firebase.config';
import { UserRole, UserPermissions } from '@/utils/firebase/adminAuth';
import { UserPreferences, UserProfile, ColorScheme } from '@/types';

// Default user preferences
const defaultUserPreferences: UserPreferences = {
  isDark: false,
  colorScheme: 'modern-purple' as ColorScheme,
  emailNotifications: true,
  courseUpdates: true,
  marketingEmails: false,
  language: 'en',
  lastUpdated: new Date(),
};

// Auth state interface
interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  userPreferences: UserPreferences | null;
  authLoading: boolean;
  isAdmin: boolean;
  error: string | null;
}

// Auth action types
type AuthAction =
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_USER_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_USER_PREFERENCES'; payload: UserPreferences | null }
  | { type: 'SET_IS_ADMIN'; payload: boolean }
  | { type: 'SET_AUTH_ERROR'; payload: string | null }
  | { type: 'CLEAR_AUTH_STATE' };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload };
    case 'SET_USER_PREFERENCES':
      return { ...state, userPreferences: action.payload };
    case 'SET_IS_ADMIN':
      return { ...state, isAdmin: action.payload };
    case 'SET_AUTH_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_AUTH_STATE':
      return {
        user: null,
        userProfile: null,
        userPreferences: null,
        authLoading: false,
        isAdmin: false,
        error: null,
      };
    default:
      return state;
  }
};

// Initial auth state
const initialAuthState: AuthState = {
  user: null,
  userProfile: null,
  userPreferences: null,
  authLoading: true,
  isAdmin: false,
  error: null,
};

// Auth context interface
interface AuthContextType {
  // State
  user: User | null;
  userProfile: UserProfile | null;
  userPreferences: UserPreferences | null;
  authLoading: boolean;
  isAdmin: boolean;
  error: string | null;

  // Authentication methods
  signUpWithEmail: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOutUser: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;

  // Profile management
  updateUserProfile: (
    updates: Partial<UserProfile>
  ) => Promise<{ success: boolean; error?: string }>;

  // Preferences management
  saveUserPreferences: (
    preferences: Partial<UserPreferences>
  ) => Promise<{ success: boolean; error?: string }>;

  // Utilities
  checkAdminStatus: (email: string) => boolean;
  clearAuthError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Check if user is admin based on email
  const checkAdminStatus = useCallback((email: string): boolean => {
    // Get admin emails from environment variable (comma-separated)
    const adminEmailsString = process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
    const adminEmails = adminEmailsString
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);

    // Fallback to default if no environment variable is set
    if (adminEmails.length === 0) {
      console.warn('NEXT_PUBLIC_ADMIN_EMAILS not configured. Using fallback admin emails.');
      return ['admin@cursuri.com', 'support@cursuri.com'].includes(email.toLowerCase());
    }

    return adminEmails.includes(email.toLowerCase());
  }, []);

  // Clear auth error
  const clearAuthError = useCallback(() => {
    dispatch({ type: 'SET_AUTH_ERROR', payload: null });
  }, []);

  // Load user profile from Firestore
  const loadUserProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(firestoreDB, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }, []);

  // Load user preferences from Firestore
  const loadUserPreferences = useCallback(async (uid: string): Promise<UserPreferences | null> => {
    try {
      const preferencesDoc = await getDoc(doc(firestoreDB, 'userPreferences', uid));
      if (preferencesDoc.exists()) {
        const data = preferencesDoc.data();
        return {
          ...data,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        } as UserPreferences;
      }
      return null;
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return null;
    }
  }, []);

  // Create user profile in Firestore
  const createUserProfile = useCallback(
    async (user: User, displayName?: string): Promise<UserProfile> => {
      const userProfile: UserProfile = {
        id: user.uid,
        email: user.email || '',
        displayName: displayName || user.displayName || '',
        photoURL: user.photoURL || undefined,
        role: 'user' as UserRole,
        isActive: true,
        permissions: {
          canManageCourses: false,
          canManageUsers: false,
          canManagePayments: false,
          canViewAnalytics: false,
          canManageSettings: false,
        } as UserPermissions,
        createdAt: serverTimestamp() as Timestamp,
        emailVerified: user.emailVerified,
        enrollments: {},
      };

      await setDoc(doc(firestoreDB, 'users', user.uid), userProfile);
      return userProfile;
    },
    []
  );

  // Create user preferences in Firestore
  const createUserPreferences = useCallback(async (uid: string): Promise<UserPreferences> => {
    const preferences: UserPreferences = {
      ...defaultUserPreferences,
      lastUpdated: serverTimestamp() as Timestamp,
    };

    await setDoc(doc(firestoreDB, 'userPreferences', uid), preferences);
    return {
      ...preferences,
      lastUpdated: new Date(),
    };
  }, []);

  // Sign up with email and password
  const signUpWithEmail = useCallback(
    async (
      email: string,
      password: string,
      displayName?: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        dispatch({ type: 'SET_AUTH_LOADING', payload: true });
        dispatch({ type: 'SET_AUTH_ERROR', payload: null });

        const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, password);

        if (displayName) {
          await updateProfile(user, { displayName });
        }

        // Send email verification
        await sendEmailVerification(user);

        // Create user profile and preferences
        const userProfile = await createUserProfile(user, displayName);
        const userPreferences = await createUserPreferences(user.uid);

        dispatch({ type: 'SET_USER_PROFILE', payload: userProfile });
        dispatch({ type: 'SET_USER_PREFERENCES', payload: userPreferences });

        return { success: true };
      } catch (error) {
        const authError = error as AuthError;
        const errorMessage = authError.message || 'Failed to create account';
        dispatch({ type: 'SET_AUTH_ERROR', payload: errorMessage });
        return { success: false, error: errorMessage };
      } finally {
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
      }
    },
    [createUserProfile, createUserPreferences]
  );

  // Sign in with email and password
  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        dispatch({ type: 'SET_AUTH_LOADING', payload: true });
        dispatch({ type: 'SET_AUTH_ERROR', payload: null });

        await signInWithEmailAndPassword(firebaseAuth, email, password);
        return { success: true };
      } catch (error) {
        const authError = error as AuthError;
        const errorMessage = authError.message || 'Failed to sign in';
        dispatch({ type: 'SET_AUTH_ERROR', payload: errorMessage });
        return { success: false, error: errorMessage };
      } finally {
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
      }
    },
    []
  );

  // Sign in with Google
  const signInWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      dispatch({ type: 'SET_AUTH_LOADING', payload: true });
      dispatch({ type: 'SET_AUTH_ERROR', payload: null });

      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(firebaseAuth, provider);

      // Check if user profile exists, create if not
      let userProfile = await loadUserProfile(user.uid);
      if (!userProfile) {
        userProfile = await createUserProfile(user);
      }

      // Check if user preferences exist, create if not
      let userPreferences = await loadUserPreferences(user.uid);
      if (!userPreferences) {
        userPreferences = await createUserPreferences(user.uid);
      }

      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      const errorMessage = authError.message || 'Failed to sign in with Google';
      dispatch({ type: 'SET_AUTH_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_AUTH_LOADING', payload: false });
    }
  }, [loadUserProfile, createUserProfile, loadUserPreferences, createUserPreferences]);

  // Sign out user
  const signOutUser = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await signOut(firebaseAuth);
      dispatch({ type: 'CLEAR_AUTH_STATE' });
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      const errorMessage = authError.message || 'Failed to sign out';
      dispatch({ type: 'SET_AUTH_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      try {
        await sendPasswordResetEmail(firebaseAuth, email);
        return { success: true };
      } catch (error) {
        const authError = error as AuthError;
        const errorMessage = authError.message || 'Failed to send password reset email';
        dispatch({ type: 'SET_AUTH_ERROR', payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // Update user profile
  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
      if (!state.user || !state.userProfile) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        const userDocRef = doc(firestoreDB, 'users', state.user.uid);
        const updatedProfile = {
          ...updates,
          updatedAt: serverTimestamp(),
        };

        await updateDoc(userDocRef, updatedProfile);

        // Update local state
        dispatch({
          type: 'SET_USER_PROFILE',
          payload: { ...state.userProfile, ...updates, updatedAt: new Date() },
        });
        return { success: true };
      } catch (err) {
        console.error('Error updating profile:', err);
        const errorMessage = 'Failed to update profile';
        dispatch({ type: 'SET_AUTH_ERROR', payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    },
    [state.user, state.userProfile]
  );

  // Save user preferences
  const saveUserPreferences = useCallback(
    async (
      preferences: Partial<UserPreferences>
    ): Promise<{ success: boolean; error?: string }> => {
      if (!state.user) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        const preferencesDocRef = doc(firestoreDB, 'userPreferences', state.user.uid);
        const updatedPreferences = {
          ...preferences,
          lastUpdated: serverTimestamp(),
        };

        await updateDoc(preferencesDocRef, updatedPreferences);

        // Update local state
        const currentPreferences = state.userPreferences || defaultUserPreferences;
        dispatch({
          type: 'SET_USER_PREFERENCES',
          payload: {
            ...currentPreferences,
            ...preferences,
            lastUpdated: new Date(),
          },
        });
        return { success: true };
      } catch (err) {
        console.error('Error saving preferences:', err);
        const errorMessage = 'Failed to save preferences';
        dispatch({ type: 'SET_AUTH_ERROR', payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    },
    [state.user, state.userPreferences]
  );

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      dispatch({ type: 'SET_AUTH_LOADING', payload: true });

      if (user) {
        dispatch({ type: 'SET_USER', payload: user });

        // Check admin status
        const isAdmin = checkAdminStatus(user.email || '');
        dispatch({ type: 'SET_IS_ADMIN', payload: isAdmin });

        // Load user profile and preferences
        const [userProfile, userPreferences] = await Promise.all([
          loadUserProfile(user.uid),
          loadUserPreferences(user.uid),
        ]);

        // Create profile if it doesn't exist
        if (!userProfile) {
          const newProfile = await createUserProfile(user);
          dispatch({ type: 'SET_USER_PROFILE', payload: newProfile });
        } else {
          dispatch({ type: 'SET_USER_PROFILE', payload: userProfile });
        }

        // Create preferences if they don't exist
        if (!userPreferences) {
          const newPreferences = await createUserPreferences(user.uid);
          dispatch({ type: 'SET_USER_PREFERENCES', payload: newPreferences });
        } else {
          dispatch({ type: 'SET_USER_PREFERENCES', payload: userPreferences });
        }
      } else {
        dispatch({ type: 'CLEAR_AUTH_STATE' });
      }

      dispatch({ type: 'SET_AUTH_LOADING', payload: false });
    });

    return () => unsubscribe();
  }, [
    checkAdminStatus,
    loadUserProfile,
    loadUserPreferences,
    createUserProfile,
    createUserPreferences,
  ]);

  // Context value
  const value: AuthContextType = {
    // State
    user: state.user,
    userProfile: state.userProfile,
    userPreferences: state.userPreferences,
    authLoading: state.authLoading,
    isAdmin: state.isAdmin,
    error: state.error,

    // Authentication methods
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOutUser,
    resetPassword,

    // Profile management
    updateUserProfile,

    // Preferences management
    saveUserPreferences,

    // Utilities
    checkAdminStatus,
    clearAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
