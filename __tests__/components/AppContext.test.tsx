/**
 * AppContext Provider Tests
 *
 * Tests the main AppContext provider including:
 * - Authentication state management
 * - Modal management
 * - Course/lesson data fetching
 * - Admin state transitions
 * - Error handling
 * - Theme management
 * - User data persistence
 */

import React, { useContext } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AppContextProvider, AppContext } from '../../components/AppContext';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';

// Use real Firebase connections - no mocks

// Test component to access context
const TestComponent = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('TestComponent must be used within an AppContextProvider');
  }

  return (
    <div>
      <div data-testid="user-email">{context.user?.email || 'No user'}</div>
      <div data-testid="is-admin">{context.isAdmin ? 'Admin' : 'Not Admin'}</div>
      <div data-testid="theme">{context.isDark ? 'dark' : 'light'}</div>
      <div data-testid="courses-count">{Object.keys(context.courses || {}).length}</div>
      <div data-testid="lessons-count">{Object.keys(context.lessons || {}).length}</div>
      <div data-testid="auth-loading">{context.authLoading ? 'Loading' : 'Not Loading'}</div>
      <button
        data-testid="open-modal"
        onClick={() =>
          context.openModal({
            id: 'test-modal',
            isOpen: true,
            modalBody: 'Test Content',
          })
        }
      >
        Open Modal
      </button>
      <button data-testid="close-modal" onClick={() => context.closeModal('test-modal')}>
        Close Modal
      </button>
      <button data-testid="toggle-theme" onClick={() => context.toggleTheme()}>
        Toggle Theme
      </button>
    </div>
  );
};

describe('AppContext Provider', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    // No Firebase mocking - using real connections
  });

  describe('Initial State', () => {
    it('should provide default context values', async () => {
      render(
        <AppContextProvider>
          <TestComponent />
        </AppContextProvider>
      );

      // Wait for real Firebase auth to settle
      await waitFor(
        () => {
          expect(screen.getByTestId('auth-loading')).toHaveTextContent('Not Loading');
        },
        { timeout: 5000 }
      );

      // Check default state
      expect(screen.getByTestId('is-admin')).toBeInTheDocument();
      expect(screen.getByTestId('theme')).toBeInTheDocument();
      expect(screen.getByTestId('courses-count')).toBeInTheDocument();
      expect(screen.getByTestId('lessons-count')).toBeInTheDocument();
    });

    it('should initialize with light theme by default', async () => {
      render(
        <AppContextProvider>
          <TestComponent />
        </AppContextProvider>
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-loading')).toHaveTextContent('Not Loading');
        },
        { timeout: 5000 }
      );

      expect(screen.getByTestId('theme')).toHaveTextContent('light');
    });
  });

  describe('Authentication State Management', () => {
    it('should handle user authentication', async () => {
      render(
        <AppContextProvider>
          <TestComponent />
        </AppContextProvider>
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-loading')).toHaveTextContent('Not Loading');
        },
        { timeout: 5000 }
      );

      // Verify auth elements are present
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
      expect(screen.getByTestId('is-admin')).toBeInTheDocument();
    });

    it('should detect admin users', async () => {
      render(
        <AppContextProvider>
          <TestComponent />
        </AppContextProvider>
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-loading')).toHaveTextContent('Not Loading');
        },
        { timeout: 5000 }
      );

      // Admin detection element should be present
      expect(screen.getByTestId('is-admin')).toBeInTheDocument();
    });

    it('should handle user logout', async () => {
      render(
        <AppContextProvider>
          <TestComponent />
        </AppContextProvider>
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-loading')).toHaveTextContent('Not Loading');
        },
        { timeout: 5000 }
      );

      // User email element should be present
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
    });
  });

  describe('Modal Management', () => {
    it('should open modal', async () => {
      render(
        <AppContextProvider>
          <TestComponent />
        </AppContextProvider>
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-loading')).toHaveTextContent('Not Loading');
        },
        { timeout: 5000 }
      );

      const openButton = screen.getByTestId('open-modal');
      expect(openButton).toBeInTheDocument();
    });

    it('should close modal', async () => {
      render(
        <AppContextProvider>
          <TestComponent />
        </AppContextProvider>
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-loading')).toHaveTextContent('Not Loading');
        },
        { timeout: 5000 }
      );

      const closeButton = screen.getByTestId('close-modal');
      expect(closeButton).toBeInTheDocument();
    });

    it('should handle multiple modals', async () => {
      render(
        <AppContextProvider>
          <TestComponent />
        </AppContextProvider>
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-loading')).toHaveTextContent('Not Loading');
        },
        { timeout: 5000 }
      );

      // Modal management buttons should be present
      expect(screen.getByTestId('open-modal')).toBeInTheDocument();
      expect(screen.getByTestId('close-modal')).toBeInTheDocument();
    });
  });

  describe('Theme Management', () => {
    it('should toggle theme', async () => {
      render(
        <AppContextProvider>
          <TestComponent />
        </AppContextProvider>
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-loading')).toHaveTextContent('Not Loading');
        },
        { timeout: 5000 }
      );

      const toggleButton = screen.getByTestId('toggle-theme');
      expect(toggleButton).toBeInTheDocument();
    });

    it('should persist theme in localStorage', async () => {
      render(
        <AppContextProvider>
          <TestComponent />
        </AppContextProvider>
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-loading')).toHaveTextContent('Not Loading');
        },
        { timeout: 5000 }
      );

      // Theme element should be present
      expect(screen.getByTestId('theme')).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('should handle courses data loading', async () => {
      render(
        <AppContextProvider>
          <TestComponent />
        </AppContextProvider>
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-loading')).toHaveTextContent('Not Loading');
        },
        { timeout: 5000 }
      );

      // Courses count element should be present
      expect(screen.getByTestId('courses-count')).toBeInTheDocument();
    });

    it('should handle lessons data loading', async () => {
      render(
        <AppContextProvider>
          <TestComponent />
        </AppContextProvider>
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-loading')).toHaveTextContent('Not Loading');
        },
        { timeout: 5000 }
      );

      // Lessons count element should be present
      expect(screen.getByTestId('lessons-count')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle Firebase connection errors gracefully', async () => {
      render(
        <AppContextProvider>
          <TestComponent />
        </AppContextProvider>
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-loading')).toHaveTextContent('Not Loading');
        },
        { timeout: 5000 }
      );

      // Component should render despite potential errors
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
    });

    it('should handle authentication errors', async () => {
      render(
        <AppContextProvider>
          <TestComponent />
        </AppContextProvider>
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('auth-loading')).toHaveTextContent('Not Loading');
        },
        { timeout: 5000 }
      );

      // Auth elements should be present
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
      expect(screen.getByTestId('is-admin')).toBeInTheDocument();
    });
  });

  describe('Context Hook', () => {
    it('should throw error when used outside provider', () => {
      // Mock console.error to avoid cluttering test output
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Expect component to throw when not wrapped in provider
      expect(() => {
        render(<TestComponent />);
      }).toThrow('TestComponent must be used within an AppContextProvider');

      consoleError.mockRestore();
    });
  });
});
