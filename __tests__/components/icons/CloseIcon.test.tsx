import React from 'react';
import { render, screen } from '@testing-library/react';
import CloseIcon from '@/components/icons/CloseIcon';

describe('CloseIcon Component', () => {
    const getSvg = () => document.querySelector('svg')!;

    it('renders with default props', () => {
        render(<CloseIcon />);

        const svg = getSvg();
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass('w-4');
        expect(svg).toHaveClass('h-4');
    });

    it('applies custom className', () => {
        render(<CloseIcon className="w-8 h-8 text-red-500" />);

        const svg = getSvg();
        expect(svg).toHaveClass('w-8');
        expect(svg).toHaveClass('h-8');
        expect(svg).toHaveClass('text-red-500');
    });

    it('has correct SVG attributes', () => {
        render(<CloseIcon />);

        const svg = getSvg();
        expect(svg).toHaveAttribute('fill', 'none');
        expect(svg).toHaveAttribute('stroke', 'currentColor');
        expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
        expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    });

    it('contains correct path with close icon shape', () => {
        render(<CloseIcon />);

        const svg = getSvg();
        const path = svg.querySelector('path');

        expect(path).toBeInTheDocument();
        expect(path).toHaveAttribute('stroke-linecap', 'round');
        expect(path).toHaveAttribute('stroke-linejoin', 'round');
        expect(path).toHaveAttribute('stroke-width', '2');
        expect(path).toHaveAttribute('d', 'M6 18L18 6M6 6l12 12');
    });

    it('works without className prop', () => {
        render(<CloseIcon />);

        const svg = getSvg();
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass('w-4', 'h-4');
    });

    it('works as child component', () => {
        render(
            <div data-testid="parent">
                <CloseIcon />
            </div>
        );

        const parent = screen.getByTestId('parent');
        const svg = getSvg();

        expect(parent).toContainElement(svg);
    });

    it('handles complex className strings', () => {
        const complexClassName = "w-6 h-6 text-gray-600 hover:text-red-500 transition-colors duration-200";
        render(<CloseIcon className={complexClassName} />);

        const svg = getSvg();
        expect(svg).toHaveClass('w-6');
        expect(svg).toHaveClass('h-6');
        expect(svg).toHaveClass('text-gray-600');
        expect(svg).toHaveClass('hover:text-red-500');
        expect(svg).toHaveClass('transition-colors');
        expect(svg).toHaveClass('duration-200');
    });

    it('maintains accessibility with proper SVG element', () => {
        render(<CloseIcon />);

        const svg = getSvg();
        expect(svg.tagName).toBe('svg');
    });

    it('uses currentColor for stroke', () => {
        render(<CloseIcon />);

        const svg = getSvg();
        expect(svg).toHaveAttribute('stroke', 'currentColor');
    });

    it('has correct stroke properties for clean rendering', () => {
        render(<CloseIcon />);

        const svg = getSvg();
        const path = svg.querySelector('path');

        expect(path).toHaveAttribute('stroke-linecap', 'round');
        expect(path).toHaveAttribute('stroke-linejoin', 'round');
        expect(path).toHaveAttribute('stroke-width', '2');
    });
});