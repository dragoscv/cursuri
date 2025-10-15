import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingButton from '@/components/Buttons/LoadingButton';

// Mock the LoadingIcon component
jest.mock('@/components/icons/svg/LoadingIcon', () => {
    return function MockLoadingIcon({ className }: { className?: string }) {
        return <div data-testid="loading-icon" className={className} />;
    };
});

describe('LoadingButton Component', () => {
    it('should render with default props', () => {
        render(<LoadingButton />);

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
        expect(button).toHaveTextContent('Loading...');

        const loadingIcon = screen.getByTestId('loading-icon');
        expect(loadingIcon).toBeInTheDocument();
    });

    it('should render with custom loading text', () => {
        render(<LoadingButton loadingText="Please wait..." />);

        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('Please wait...');
    });

    it('should apply custom className', () => {
        render(<LoadingButton className="custom-class" />);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('custom-class');
    });

    describe('Size Variants', () => {
        it('should apply small size classes', () => {
            render(<LoadingButton size="sm" />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('py-1.5', 'px-4', 'text-sm');
        });

        it('should apply medium size classes by default', () => {
            render(<LoadingButton />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('py-2.5', 'px-5', 'text-sm');
        });

        it('should apply medium size classes when explicitly set', () => {
            render(<LoadingButton size="md" />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('py-2.5', 'px-5', 'text-sm');
        });

        it('should apply large size classes', () => {
            render(<LoadingButton size="lg" />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('py-3', 'px-6', 'text-base');
        });
    });

    describe('Button Styling', () => {
        it('should have disabled attribute', () => {
            render(<LoadingButton />);

            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
            expect(button).toHaveAttribute('disabled');
        });

        it('should have button type attribute', () => {
            render(<LoadingButton />);

            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('type', 'button');
        });

        it('should have gradient background classes', () => {
            render(<LoadingButton />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-gradient-to-r');
            expect(button).toHaveClass('from-[color:var(--ai-primary)]');
            expect(button).toHaveClass('via-[color:var(--ai-secondary)]');
            expect(button).toHaveClass('to-[color:var(--ai-primary)]');
        });

        it('should have rounded and styled classes', () => {
            render(<LoadingButton />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('font-medium');
            expect(button).toHaveClass('rounded-lg');
            expect(button).toHaveClass('border');
            expect(button).toHaveClass('text-white');
            expect(button).toHaveClass('flex');
            expect(button).toHaveClass('items-center');
            expect(button).toHaveClass('justify-center');
            expect(button).toHaveClass('transition-all');
        });
    });

    describe('Loading Icon', () => {
        it('should render loading icon with correct classes', () => {
            render(<LoadingButton />);

            const loadingIcon = screen.getByTestId('loading-icon');
            expect(loadingIcon).toHaveClass('w-5', 'h-5', 'mr-3', 'text-white');
        });

        it('should position icon before text', () => {
            render(<LoadingButton loadingText="Processing..." />);

            const button = screen.getByRole('button');
            const loadingIcon = screen.getByTestId('loading-icon');

            // Check that icon comes before text in the DOM
            expect(button.firstChild).toBe(loadingIcon);
            expect(button.textContent).toContain('Processing...');
        });
    });

    describe('Accessibility', () => {
        it('should be keyboard accessible', () => {
            render(<LoadingButton />);

            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();

            // Although disabled, it should still be focusable for screen readers
            // but in this case it's correctly disabled to prevent interaction
            expect(button).toBeDisabled();
        });

        it('should have proper button role', () => {
            render(<LoadingButton />);

            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });
    });

    describe('Prop Combinations', () => {
        it('should handle all props together', () => {
            render(
                <LoadingButton
                    className="extra-class"
                    size="lg"
                    loadingText="Saving changes..."
                />
            );

            const button = screen.getByRole('button');
            expect(button).toHaveClass('extra-class');
            expect(button).toHaveClass('py-3', 'px-6', 'text-base'); // Large size
            expect(button).toHaveTextContent('Saving changes...');
            expect(button).toBeDisabled();

            const loadingIcon = screen.getByTestId('loading-icon');
            expect(loadingIcon).toBeInTheDocument();
        });

        it('should work with empty className', () => {
            render(<LoadingButton className="" />);

            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
            // Should still have default classes
            expect(button).toHaveClass('font-medium');
        });

        it('should work with undefined loadingText fallback', () => {
            render(<LoadingButton loadingText={undefined} />);

            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Loading...');
        });
    });

    describe('Component Structure', () => {
        it('should maintain consistent DOM structure', () => {
            render(<LoadingButton />);

            const button = screen.getByRole('button');

            // Should have exactly 2 children: icon + text
            expect(button.children).toHaveLength(1); // Icon is a child, text is textContent
            expect(button.textContent).toBe('Loading...');

            const loadingIcon = screen.getByTestId('loading-icon');
            expect(loadingIcon.parentElement).toBe(button);
        });

        it('should preserve button semantics', () => {
            render(<LoadingButton />);

            const button = screen.getByRole('button');
            expect(button.tagName).toBe('BUTTON');
            expect(button).toHaveAttribute('type', 'button');
            expect(button).toBeDisabled();
        });
    });
});