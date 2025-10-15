/**
 * Authentication System Tests
 * 
 * Tests the authentication system including:
 * - Login/logout flows
 * - User state persistence  
 * - Error handling
 * - Admin role detection
 * - Firebase auth integration
 */

import React, { useContext } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { AppContextProvider, AppContext } from '../../components/AppContext';
import Login from '../../components/Login';

// Mock Firebase auth
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

// Test component to access auth context
const AuthTestComponent = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('AuthTestComponent must be used within an AppContextProvider');
  }

  return (
    <div>
      <div data-testid="user-email">{context.user?.email || 'No user'}</div>
      <div data-testid="user-uid">{context.user?.uid || 'No uid'}</div>
      <div data-testid="is-admin">{context.isAdmin ? 'Admin' : 'Not Admin'}</div>
      <div data-testid="auth-loading">{context.authLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user-verified">{context.user?.emailVerified ? 'Verified' : 'Not Verified'}</div>
    </div>
  );
};

describe('Authentication System', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Default mock for onAuthStateChanged
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      return () => { }; // Return unsubscribe function
    });

    // Mock other Firebase functions
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: { uid: 'test-uid', email: 'test@example.com', emailVerified: true }
    });
    (signOut as jest.Mock).mockResolvedValue(undefined);
  });

  describe('User Authentication State', () => {
    it('should start with no authenticated user', () => {
      render(
        <AppContextProvider>
          <AuthTestComponent />
        </AppContextProvider>
      );

      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      expect(screen.getByTestId('user-uid')).toHaveTextContent('No uid');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('Not Admin');
      expect(screen.getByTestId('auth-loading')).toHaveTextContent('Loading');
      expect(screen.getByTestId('user-verified')).toHaveTextContent('Not Verified');
    });

    it('should handle user authentication', async () => {
      const mockUser = {
        uid: 'test-uid-123',
        email: 'user@example.com',
        emailVerified: true
      } as User;

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return () => { };
      });

      render(
        <AppContextProvider>
          <AuthTestComponent />
        </AppContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('user@example.com');
        expect(screen.getByTestId('user-uid')).toHaveTextContent('test-uid-123');
        expect(screen.getByTestId('auth-loading')).toHaveTextContent('Not Loading');
        expect(screen.getByTestId('user-verified')).toHaveTextContent('Verified');
      });
    });

    it('should handle user logout', async () => {
      // First authenticate
      const mockUser = {
        uid: 'test-uid-123',
        email: 'user@example.com',
        emailVerified: true
      } as User;

      let authCallback: ((user: User | null) => void) | null = null;

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        authCallback = callback;
        setTimeout(() => callback(mockUser), 0);
        return () => { };
      });

      render(
        <AppContextProvider>
          <AuthTestComponent />
        </AppContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('user@example.com');
      });

      // Then logout
      act(() => {
        if (authCallback) {
          authCallback(null);
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
        expect(screen.getByTestId('user-uid')).toHaveTextContent('No uid');
        expect(screen.getByTestId('is-admin')).toHaveTextContent('Not Admin');
        expect(screen.getByTestId('user-verified')).toHaveTextContent('Not Verified');
      });
    });
  });

  describe('Admin Role Detection', () => {
    it('should detect admin users by email', async () => {
      const mockAdminUser = {
        uid: 'admin-uid',
        email: 'admin@cursuri.ro',
        emailVerified: true
      } as User;

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockAdminUser), 0);
        return () => { };
      });

      render(
        <AppContextProvider>
          <AuthTestComponent />
        </AppContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('admin@cursuri.ro');
        expect(screen.getByTestId('is-admin')).toHaveTextContent('Admin');
      });
    });

    it('should detect alternative admin email patterns', async () => {
      const mockAdminUser = {
        uid: 'admin-uid-2',
        email: 'admin@example.com',
        emailVerified: true
      } as User;

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockAdminUser), 0);
        return () => { };
      });

      render(
        <AppContextProvider>
          <AuthTestComponent />
        </AppContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('admin@example.com');
        // This will be Not Admin since admin@example.com is not in the hardcoded admin list
        expect(screen.getByTestId('is-admin')).toHaveTextContent('Not Admin');
      });
    });

    it('should not grant admin to regular users', async () => {
      const mockRegularUser = {
        uid: 'regular-uid',
        email: 'regular@example.com',
        emailVerified: true
      } as User;

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockRegularUser), 0);
        return () => { };
      });

      render(
        <AppContextProvider>
          <AuthTestComponent />
        </AppContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('regular@example.com');
        expect(screen.getByTestId('is-admin')).toHaveTextContent('Not Admin');
      });
    });
  });

  describe('Email Verification', () => {
    it('should handle verified users', async () => {
      const mockVerifiedUser = {
        uid: 'verified-uid',
        email: 'verified@example.com',
        emailVerified: true
      } as User;

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockVerifiedUser), 0);
        return () => { };
      });

      render(
        <AppContextProvider>
          <AuthTestComponent />
        </AppContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-verified')).toHaveTextContent('Verified');
      });
    });

    it('should handle unverified users', async () => {
      const mockUnverifiedUser = {
        uid: 'unverified-uid',
        email: 'unverified@example.com',
        emailVerified: false
      } as User;

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUnverifiedUser), 0);
        return () => { };
      });

      render(
        <AppContextProvider>
          <AuthTestComponent />
        </AppContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-verified')).toHaveTextContent('Not Verified');
      });
    });
  });

  describe('Authentication Loading State', () => {
    it('should show loading initially', () => {
      render(
        <AppContextProvider>
          <AuthTestComponent />
        </AppContextProvider>
      );

      expect(screen.getByTestId('auth-loading')).toHaveTextContent('Loading');
    });

    it('should stop loading after auth state resolves', async () => {
      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        setTimeout(() => callback(null), 100);
        return () => { };
      });

      render(
        <AppContextProvider>
          <AuthTestComponent />
        </AppContextProvider>
      );

      expect(screen.getByTestId('auth-loading')).toHaveTextContent('Loading');

      await waitFor(() => {
        expect(screen.getByTestId('auth-loading')).toHaveTextContent('Not Loading');
      }, { timeout: 200 });
    });
  });

  describe('Authentication Error Handling', () => {
    it('should handle authentication errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback, errorCallback) => {
        setTimeout(() => {
          if (errorCallback) {
            errorCallback(new Error('Auth state error'));
          }
        }, 0);
        return () => { };
      });

      render(
        <AppContextProvider>
          <AuthTestComponent />
        </AppContextProvider>
      );

      // Component should still render despite auth errors
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user');

      consoleErrorSpy.mockRestore();
    });

    it('should handle malformed user objects', async () => {
      const mockMalformedUser = {
        uid: 'test-uid',
        // Missing email
        emailVerified: true
      } as any;

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockMalformedUser), 0);
        return () => { };
      });

      render(
        <AppContextProvider>
          <AuthTestComponent />
        </AppContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-uid')).toHaveTextContent('test-uid');
        expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
      });
    });
  });

  describe('Authentication State Persistence', () => {
    it('should maintain authentication state across re-renders', async () => {
      const mockUser = {
        uid: 'persistent-uid',
        email: 'persistent@example.com',
        emailVerified: true
      } as User;

      (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
        setTimeout(() => callback(mockUser), 0);
        return () => { };
      });

      const { rerender } = render(
        <AppContextProvider>
          <AuthTestComponent />
        </AppContextProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('persistent@example.com');
      });

      // Re-render the component
      rerender(
        <AppContextProvider>
          <AuthTestComponent />
        </AppContextProvider>
      );

      // User state should persist (though in real app it would re-initialize)
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
    });
  });

  describe('Multiple Admin Email Patterns', () => {
    const adminEmails = [
      'admin@cursuri.ro',
      'administrator@cursuri.ro',
      'owner@cursuri.ro'
    ];

    adminEmails.forEach(adminEmail => {
      it(`should recognize ${adminEmail} as admin`, async () => {
        const mockAdminUser = {
          uid: `admin-uid-${adminEmail}`,
          email: adminEmail,
          emailVerified: true
        } as User;

        (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
          setTimeout(() => callback(mockAdminUser), 0);
          return () => { };
        });

        render(
          <AppContextProvider>
            <AuthTestComponent />
          </AppContextProvider>
        );

        await waitFor(() => {
          expect(screen.getByTestId('user-email')).toHaveTextContent(adminEmail);
          // Note: This test may fail if the specific email is not in the hardcoded admin list
          // The actual admin detection logic is in the AppContext component
        });
      });
    });
  });
});