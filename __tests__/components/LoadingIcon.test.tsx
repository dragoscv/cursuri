import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingIcon from '@/components/icons/svg/LoadingIcon';

describe('LoadingIcon Component', () => {
    const getSvg = () => screen.getByRole('status', { hidden: true });

    it('should render with default props', () => {
        render(<LoadingIcon />);

        const svg = getSvg();
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('should apply default className', () => {
        render(<LoadingIcon />);

        const svg = getSvg();
        expect(svg).toHaveClass('animate-spin');
        expect(svg).toHaveClass('w-5');
        expect(svg).toHaveClass('h-5');
    });

    it('should apply custom className', () => {
        render(<LoadingIcon className="custom-class w-8 h-8" />);

        const svg = screen.getByRole('status', { hidden: true });
        expect(svg).toHaveClass('animate-spin');
        expect(svg).toHaveClass('custom-class');
        expect(svg).toHaveClass('w-8');
        expect(svg).toHaveClass('h-8');
    });

    it('should apply size prop as width and height attributes', () => {
        render(<LoadingIcon size={32} />);

        const svg = screen.getByRole('status', { hidden: true });
        expect(svg).toHaveAttribute('width', '32');
        expect(svg).toHaveAttribute('height', '32');
    });

    it('should use default size when size prop is not provided', () => {
        render(<LoadingIcon />);

        const svg = screen.getByRole('status', { hidden: true });
        expect(svg).toHaveAttribute('width', '20');
        expect(svg).toHaveAttribute('height', '20');
    });

    describe('SVG Structure', () => {
        it('should have correct SVG attributes', () => {
            render(<LoadingIcon />);

            const svg = screen.getByRole('status', { hidden: true });
            expect(svg).toHaveAttribute('viewBox', '0 0 100 101');
            expect(svg).toHaveAttribute('fill', 'none');
            expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
        });

        it('should contain two path elements', () => {
            render(<LoadingIcon />);

            const svg = screen.getByRole('status', { hidden: true });
            const paths = svg.querySelectorAll('path');
            expect(paths).toHaveLength(2);
        });

        it('should have correct path fill attributes', () => {
            render(<LoadingIcon />);

            const svg = screen.getByRole('status', { hidden: true });
            const paths = svg.querySelectorAll('path');

            // First path should have fill="currentColor"
            expect(paths[0]).toHaveAttribute('fill', 'currentColor');

            // Second path should have fill="currentColor" and custom class
            expect(paths[1]).toHaveAttribute('fill', 'currentColor');
            expect(paths[1]).toHaveClass('text-[color:var(--ai-accent)]');
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA attributes', () => {
            render(<LoadingIcon />);

            const svg = screen.getByRole('status', { hidden: true });
            expect(svg).toHaveAttribute('aria-hidden', 'true');
            expect(svg).toHaveAttribute('role', 'status');
        });

        it('should indicate loading state semantically', () => {
            render(<LoadingIcon />);

            const svg = screen.getByRole('status', { hidden: true });
            expect(svg).toBeInTheDocument();
        });
    });

    describe('Animation', () => {
        it('should have spin animation class', () => {
            render(<LoadingIcon />);

            const svg = screen.getByRole('status', { hidden: true });
            expect(svg).toHaveClass('animate-spin');
        });

        it('should preserve animation class when custom className is provided', () => {
            render(<LoadingIcon className="custom-class" />);

            const svg = screen.getByRole('status', { hidden: true });
            expect(svg).toHaveClass('animate-spin');
            expect(svg).toHaveClass('custom-class');
        });
    });

    describe('Props Handling', () => {
        it('should handle all props together', () => {
            render(<LoadingIcon className="text-blue-500 w-10 h-10" size={40} />);

            const svg = screen.getByRole('status', { hidden: true });
            expect(svg).toHaveClass('animate-spin');
            expect(svg).toHaveClass('text-blue-500');
            expect(svg).toHaveClass('w-10');
            expect(svg).toHaveClass('h-10');
            expect(svg).toHaveAttribute('width', '40');
            expect(svg).toHaveAttribute('height', '40');
        });

        it('should handle empty className', () => {
            render(<LoadingIcon className="" />);

            const svg = screen.getByRole('status', { hidden: true });
            expect(svg).toHaveClass('animate-spin');
            // Should not have the default w-5 h-5 classes
            expect(svg).not.toHaveClass('w-5');
            expect(svg).not.toHaveClass('h-5');
        });

        it('should handle undefined size gracefully', () => {
            render(<LoadingIcon size={undefined} />);

            const svg = screen.getByRole('status', { hidden: true });
            expect(svg).toHaveAttribute('width', '20');
            expect(svg).toHaveAttribute('height', '20');
        });
    });

    describe('CSS Variables Integration', () => {
        it('should use CSS custom properties for accent color', () => {
            render(<LoadingIcon />);

            const svg = screen.getByRole('status', { hidden: true });
            const paths = svg.querySelectorAll('path');

            // Second path should use CSS variable for accent color
            expect(paths[1]).toHaveClass('text-[color:var(--ai-accent)]');
        });
    });

    describe('Component Integration', () => {
        it('should work as a child component', () => {
            render(
                <div data-testid="parent">
                    <LoadingIcon />
                </div>
            );

            const parent = screen.getByTestId('parent');
            const svg = screen.getByRole('status', { hidden: true });

            expect(parent).toContainElement(svg);
        });

        it('should render with only supported props', () => {
            // Component only accepts className and size props
            render(<LoadingIcon className="custom-class" size={24} />);

            const svg = screen.getByRole('status', { hidden: true });
            expect(svg).toBeInTheDocument();
            expect(svg).toHaveClass('custom-class');
            expect(svg).toHaveAttribute('width', '24');
        });
    });

    describe('Edge Cases', () => {
        it('should handle very large size values', () => {
            render(<LoadingIcon size={200} />);

            const svg = screen.getByRole('status', { hidden: true });
            expect(svg).toHaveAttribute('width', '200');
            expect(svg).toHaveAttribute('height', '200');
        });

        it('should handle zero size value with fallback', () => {
            render(<LoadingIcon size={0} />);

            const svg = screen.getByRole('status', { hidden: true });
            // Size 0 falls back to default "20" due to || operator
            expect(svg).toHaveAttribute('width', '20');
            expect(svg).toHaveAttribute('height', '20');
        });

        it('should maintain functionality with complex className strings', () => {
            const complexClassName = "animate-spin text-red-500 w-12 h-12 hover:text-red-700 transition-colors duration-200";
            render(<LoadingIcon className={complexClassName} />);

            const svg = screen.getByRole('status', { hidden: true });
            expect(svg).toHaveClass('animate-spin');
            expect(svg).toHaveClass('text-red-500');
            expect(svg).toHaveClass('w-12');
            expect(svg).toHaveClass('h-12');
            expect(svg).toHaveClass('hover:text-red-700');
            expect(svg).toHaveClass('transition-colors');
            expect(svg).toHaveClass('duration-200');
        });
    });
});
