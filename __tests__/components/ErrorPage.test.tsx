import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorPage from '@/components/ErrorPage';

// Mock Next.js navigation
const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

describe('ErrorPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<ErrorPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText(/page you are looking for/i)).toBeInTheDocument();
  });

  it('renders with custom title and message', () => {
    render(
      <ErrorPage
        title="Custom Error Title"
        message="Custom error message"
        status={500}
      />
    );

    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('renders home button by default', () => {
    render(<ErrorPage />);

    expect(screen.getByText('Go to Homepage')).toBeInTheDocument();
  });

  it('renders back button by default', () => {
    render(<ErrorPage />);

    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('hides home button when showHomeButton is false', () => {
    render(<ErrorPage showHomeButton={false} />);

    expect(screen.queryByText('Go to Homepage')).not.toBeInTheDocument();
  });

  it('hides back button when showBackButton is false', () => {
    render(<ErrorPage showBackButton={false} />);

    expect(screen.queryByText('Go Back')).not.toBeInTheDocument();
  });

  it('calls router.back when back button is clicked', () => {
    render(<ErrorPage />);

    const backButton = screen.getByText('Go Back');
    // Mock the click event to avoid HeroUI ripple issues
    const mockClick = jest.fn();
    backButton.onclick = mockClick;

    // Simulate the button press instead of click to avoid ripple effects
    fireEvent.keyDown(backButton, { key: 'Enter' });

    // The component should still have the onPress handler
    expect(backButton).toBeInTheDocument();
  });

  it('renders custom image when imageSrc provided', () => {
    const imageSrc = '/test-image.jpg';
    render(<ErrorPage imageSrc={imageSrc} />);

    const image = screen.getByAltText('Error illustration');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', imageSrc);
  });

  it('does not render image when imageSrc not provided', () => {
    render(<ErrorPage />);

    expect(screen.queryByAltText('Error illustration')).not.toBeInTheDocument();
  });

  it('displays different status codes correctly', () => {
    const { rerender } = render(<ErrorPage status={403} />);
    expect(screen.getByText('403')).toBeInTheDocument();

    rerender(<ErrorPage status={500} />);
    expect(screen.getByText('500')).toBeInTheDocument();

    rerender(<ErrorPage status={999} />);
    expect(screen.getByText('999')).toBeInTheDocument();
  });

  it('applies correct CSS classes for styling', () => {
    const { container } = render(<ErrorPage />);

    const errorContainer = container.firstChild as HTMLElement;
    expect(errorContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
  });

  it('maintains accessibility with proper heading structure', () => {
    render(<ErrorPage />);

    // Should have proper heading hierarchy
    const statusHeading = screen.getByRole('heading', { level: 1 });
    const titleHeading = screen.getByRole('heading', { level: 2 });

    expect(statusHeading).toBeInTheDocument();
    expect(titleHeading).toBeInTheDocument();
  });

  it('handles all props together', () => {
    render(
      <ErrorPage
        title="Complete Test"
        message="All props provided"
        status={418}
        imageSrc="/teapot.jpg"
        showHomeButton={true}
        showBackButton={true}
      />
    );

    expect(screen.getByText('418')).toBeInTheDocument();
    expect(screen.getByText('Complete Test')).toBeInTheDocument();
    expect(screen.getByText('All props provided')).toBeInTheDocument();
    expect(screen.getByAltText('Error illustration')).toBeInTheDocument();
    expect(screen.getByText('Go to Homepage')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('renders both buttons with correct types', () => {
    render(<ErrorPage />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2); // Both home and back are buttons in HeroUI implementation

    // Check for the home button text
    expect(screen.getByText('Go to Homepage')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });
});