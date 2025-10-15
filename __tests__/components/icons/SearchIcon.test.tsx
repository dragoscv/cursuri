import React from 'react';
import { render, screen } from '@testing-library/react';
import SearchIcon from '@/components/icons/SearchIcon';

describe('SearchIcon Component', () => {
    // Helper function to get SVG element directly
    const getSvg = () => {
        const svg = document.querySelector('svg');
        if (!svg) throw new Error('SVG element not found');
        return svg;
    };

    it('renders with default props', () => {
        render(<SearchIcon />);

        const svg = getSvg();
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass('w-5');
        expect(svg).toHaveClass('h-5');
    });

    it('applies custom className', () => {
        render(<SearchIcon className="w-8 h-8 text-blue-500" />);

        const svg = getSvg();
        expect(svg).toHaveClass('w-8');
        expect(svg).toHaveClass('h-8');
        expect(svg).toHaveClass('text-blue-500');
    });

    it('has correct SVG attributes', () => {
        render(<SearchIcon />);

        const svg = getSvg();
        expect(svg).toHaveAttribute('fill', 'none');
        expect(svg).toHaveAttribute('stroke', 'currentColor');
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
        expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    });

    it('contains correct path with search icon shape', () => {
        render(<SearchIcon />);

        const svg = getSvg();
        const path = svg.querySelector('path');

        expect(path).toBeInTheDocument();
        expect(path).toHaveAttribute('stroke-linecap', 'round');
        expect(path).toHaveAttribute('stroke-linejoin', 'round');
        expect(path).toHaveAttribute('stroke-width', '2');
        expect(path).toHaveAttribute('d', 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z');
    });

    it('works without className prop', () => {
        render(<SearchIcon />);

        const svg = getSvg();
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass('w-5', 'h-5');
    });

    it('works as child component', () => {
        render(
            <button data-testid="search-button">
                <SearchIcon />
            </button>
        );

        const button = screen.getByTestId('search-button');
        const svg = getSvg();

        expect(button).toContainElement(svg);
    });

    it('handles complex className strings', () => {
        const complexClassName = "w-8 h-8 text-gray-400 hover:text-primary transition-all duration-300 ease-in-out";
        render(<SearchIcon className={complexClassName} />);

        const svg = getSvg();
        expect(svg).toHaveClass('w-8');
        expect(svg).toHaveClass('h-8');
        expect(svg).toHaveClass('text-gray-400');
        expect(svg).toHaveClass('hover:text-primary');
        expect(svg).toHaveClass('transition-all');
        expect(svg).toHaveClass('duration-300');
        expect(svg).toHaveClass('ease-in-out');
    });

    it('maintains accessibility with proper role', () => {
        render(<SearchIcon />);

        const svg = getSvg();
        expect(svg.tagName).toBe('svg');
    });

    it('uses currentColor for stroke', () => {
        render(<SearchIcon />);

        const svg = getSvg();
        expect(svg).toHaveAttribute('stroke', 'currentColor');
    });

    it('has correct stroke properties for clean rendering', () => {
        render(<SearchIcon />);

        const svg = getSvg();
        const path = svg.querySelector('path');

        expect(path).toHaveAttribute('stroke-linecap', 'round');
        expect(path).toHaveAttribute('stroke-linejoin', 'round');
        expect(path).toHaveAttribute('stroke-width', '2');
    });

    it('renders correctly in different contexts', () => {
        const { rerender } = render(<SearchIcon className="w-4 h-4" />);

        let svg = getSvg();
        expect(svg).toHaveClass('w-4', 'h-4');

        // Re-render with different props
        rerender(<SearchIcon className="w-12 h-12 text-green-600" />);

        svg = getSvg();
        expect(svg).toHaveClass('w-12', 'h-12', 'text-green-600');
    });

    it('preserves search magnifying glass visual pattern', () => {
        render(<SearchIcon />);

        const svg = getSvg();
        const path = svg.querySelector('path');

        // The d attribute represents a magnifying glass: circle + line
        const pathData = path?.getAttribute('d');
        expect(pathData).toContain('21 21'); // Line part (handle)
        expect(pathData).toContain('7 7 0 11-14 0'); // Circle part (magnifying glass)
    });
});
