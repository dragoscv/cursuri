import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../../components/Footer';
import { AppContext } from '../../components/AppContext';

// Create a mock context provider for Footer testing
const MockAppContextProvider = ({
  children,
  isDark = false,
  toggleTheme = jest.fn()
}: {
  children: React.ReactNode;
  isDark?: boolean;
  toggleTheme?: jest.Mock;
}) => {
  const mockContext = {
    isDark,
    toggleTheme,
    colorScheme: 'light' as const,
    setColorScheme: jest.fn(),
    userPreferences: null,
    saveUserPreferences: jest.fn(),
    user: null,
    authLoading: false,
    isAdmin: false,
    courses: [],
    lessons: {},
    userPurchases: [],
    modals: [],
    openModal: jest.fn(),
    closeModal: jest.fn(),
    updateModal: jest.fn(),
    fetchCourses: jest.fn(),
    fetchLessons: jest.fn(),
    getCourseById: jest.fn(),
    getLessonById: jest.fn(),
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    wishlist: [],
    bookmarks: [],
    addBookmark: jest.fn(),
    removeBookmark: jest.fn(),
    coursesLoadingState: {},
    lessonsLoadingState: {},
    products: [],
    admin: {
      users: [],
      courses: [],
      lessons: [],
    },
    adminActions: {
      fetchUsers: jest.fn(),
      updateUserRole: jest.fn(),
      deleteUser: jest.fn(),
      fetchAdminCourses: jest.fn(),
      fetchAdminLessons: jest.fn(),
    },
  } as any; // Use 'as any' to bypass complete type checking for test

  return (
    <AppContext.Provider value={mockContext}>
      {children}
    </AppContext.Provider>
  );
};

describe('Footer Component', () => {
  it('renders footer with copyright information', () => {
    render(
      <MockAppContextProvider>
        <Footer />
      </MockAppContextProvider>
    );

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} Cursuri. All rights reserved.`)).toBeInTheDocument();
  });

  it('renders footer navigation links', () => {
    render(
      <MockAppContextProvider>
        <Footer />
      </MockAppContextProvider>
    );

    // Check for actual footer links based on the component
    expect(screen.getByText('All Courses')).toBeInTheDocument();
    expect(screen.getByText('Featured Courses')).toBeInTheDocument();
    expect(screen.getByText('Testimonials')).toBeInTheDocument();
  });

  it('maintains proper semantic structure', () => {
    const { container } = render(
      <MockAppContextProvider>
        <Footer />
      </MockAppContextProvider>
    );
    const footer = container.querySelector('footer');

    expect(footer).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(
      <MockAppContextProvider>
        <Footer />
      </MockAppContextProvider>
    );

    // Check for social media links based on the component
    const githubLink = screen.getByLabelText('GitHub');
    const tiktokLink = screen.getByLabelText('TikTok');
    const websiteLink = screen.getByLabelText('Website');

    expect(githubLink).toBeInTheDocument();
    expect(tiktokLink).toBeInTheDocument();
    expect(websiteLink).toBeInTheDocument();
  });

  it('renders contact email', () => {
    render(
      <MockAppContextProvider>
        <Footer />
      </MockAppContextProvider>
    );

    expect(screen.getByText('contact@cursuri.dev')).toBeInTheDocument();
  });

  it('displays theme toggle button', () => {
    const mockToggleTheme = jest.fn();

    render(
      <MockAppContextProvider isDark={false} toggleTheme={mockToggleTheme}>
        <Footer />
      </MockAppContextProvider>
    );

    const themeButton = screen.getByText('Light Mode');
    expect(themeButton).toBeInTheDocument();

    fireEvent.click(themeButton);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('shows dark mode text when in dark mode', () => {
    render(
      <MockAppContextProvider isDark={true}>
        <Footer />
      </MockAppContextProvider>
    );

    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  });

  it('displays app version', () => {
    render(
      <MockAppContextProvider>
        <Footer />
      </MockAppContextProvider>
    );

    // Check for version text pattern
    expect(screen.getByText(/Version/)).toBeInTheDocument();
  });

  it('renders company description', () => {
    render(
      <MockAppContextProvider>
        <Footer />
      </MockAppContextProvider>
    );

    expect(screen.getByText(/Quality programming courses/)).toBeInTheDocument();
  });

  it('has correct section headers', () => {
    render(
      <MockAppContextProvider>
        <Footer />
      </MockAppContextProvider>
    );

    expect(screen.getByText('Cursuri')).toBeInTheDocument();
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('Connect')).toBeInTheDocument();
  });

  it('renders with responsive grid layout', () => {
    const { container } = render(
      <MockAppContextProvider>
        <Footer />
      </MockAppContextProvider>
    );

    const gridContainer = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
    expect(gridContainer).toBeInTheDocument();
  });
});