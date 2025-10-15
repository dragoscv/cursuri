import React from 'react';
import { render, screen } from '@testing-library/react';
import SectionHeader from '@/components/ui/SectionHeader';

// Mock icon component for testing
const MockIcon = () => <div data-testid="test-icon">📄</div>;

describe('SectionHeader Component', () => {
    it('renders with required title prop', () => {
        render(<SectionHeader title="Test Section" />);

        const title = screen.getByText('Test Section');
        expect(title).toBeInTheDocument();
        expect(title).toHaveClass('text-lg', 'font-semibold');
    });

    it('renders with title and subtitle', () => {
        render(
            <SectionHeader
                title="Main Title"
                subtitle="This is a subtitle"
            />
        );

        const title = screen.getByText('Main Title');
        const subtitle = screen.getByText('This is a subtitle');

        expect(title).toBeInTheDocument();
        expect(subtitle).toBeInTheDocument();
        expect(subtitle).toHaveClass('text-sm');
    });

    it('renders with icon, title, and subtitle', () => {
        render(
            <SectionHeader
                icon={<MockIcon />}
                title="Section with Icon"
                subtitle="Complete section header"
            />
        );

        const icon = screen.getByTestId('test-icon');
        const title = screen.getByText('Section with Icon');
        const subtitle = screen.getByText('Complete section header');

        expect(icon).toBeInTheDocument();
        expect(title).toBeInTheDocument();
        expect(subtitle).toBeInTheDocument();
    });

    it('applies custom className', () => {
        render(
            <SectionHeader
                title="Custom Section"
                className="bg-blue-100 border-blue-200"
            />
        );

        const container = screen.getByText('Custom Section').closest('div')?.parentElement;
        expect(container).toHaveClass('bg-blue-100', 'border-blue-200');
    });

    it('has correct default styling classes', () => {
        render(<SectionHeader title="Default Styling" />);

        const container = screen.getByText('Default Styling').closest('div')?.parentElement;
        expect(container).toHaveClass(
            'flex',
            'gap-3',
            'items-center',
            'px-6',
            'py-4',
            'border-b'
        );
    });

    it('does not render subtitle when not provided', () => {
        render(<SectionHeader title="Only Title" />);

        const title = screen.getByText('Only Title');
        expect(title).toBeInTheDocument();

        // Look for any paragraph elements (subtitle would be in a p tag)
        const paragraphs = screen.queryAllByRole('paragraph');
        expect(paragraphs).toHaveLength(0);
    });

    it('does not render icon when not provided', () => {
        render(<SectionHeader title="No Icon" />);

        const title = screen.getByText('No Icon');
        expect(title).toBeInTheDocument();

        // Should not find the test icon
        const icon = screen.queryByTestId('test-icon');
        expect(icon).not.toBeInTheDocument();
    });

    it('handles empty className gracefully', () => {
        render(
            <SectionHeader
                title="Empty Class"
                className=""
            />
        );

        const container = screen.getByText('Empty Class').closest('div')?.parentElement;
        expect(container).toBeInTheDocument();
        // Should still have default classes
        expect(container).toHaveClass('flex', 'gap-3', 'items-center');
    });

    it('preserves proper DOM structure', () => {
        render(
            <SectionHeader
                icon={<MockIcon />}
                title="Structure Test"
                subtitle="Testing DOM structure"
            />
        );

        const container = screen.getByText('Structure Test').closest('div')?.parentElement;
        const textContainer = screen.getByText('Structure Test').parentElement;

        expect(container).toHaveClass('flex');
        expect(textContainer).toHaveClass('flex', 'flex-col');

        // Icon should be sibling to text container
        const icon = screen.getByTestId('test-icon');
        expect(container).toContainElement(icon);
        expect(container).toContainElement(textContainer);
    });

    it('handles long titles and subtitles', () => {
        const longTitle = "This is a very long title that might wrap to multiple lines and should still render correctly";
        const longSubtitle = "This is an extremely long subtitle that provides detailed information about the section and should also handle multiple lines gracefully";

        render(
            <SectionHeader
                title={longTitle}
                subtitle={longSubtitle}
            />
        );

        const title = screen.getByText(longTitle);
        const subtitle = screen.getByText(longSubtitle);

        expect(title).toBeInTheDocument();
        expect(subtitle).toBeInTheDocument();
    });

    it('maintains accessibility with semantic heading', () => {
        render(<SectionHeader title="Accessible Section" />);

        const title = screen.getByRole('heading', { level: 2 });
        expect(title).toBeInTheDocument();
        expect(title).toHaveTextContent('Accessible Section');
    });

    it('combines custom className with default classes', () => {
        render(
            <SectionHeader
                title="Combined Classes"
                className="custom-class another-class"
            />
        );

        const container = screen.getByText('Combined Classes').closest('div')?.parentElement;

        // Should have both default and custom classes
        expect(container).toHaveClass('flex', 'gap-3', 'items-center'); // default
        expect(container).toHaveClass('custom-class', 'another-class'); // custom
    });

    it('renders with complex React node as icon', () => {
        const ComplexIcon = () => (
            <div className="complex-icon" data-testid="complex-icon">
                <span>🔥</span>
                <span className="icon-text">Hot</span>
            </div>
        );

        render(
            <SectionHeader
                icon={<ComplexIcon />}
                title="Complex Icon Test"
            />
        );

        const complexIcon = screen.getByTestId('complex-icon');
        const iconText = screen.getByText('Hot');

        expect(complexIcon).toBeInTheDocument();
        expect(iconText).toBeInTheDocument();
    });
});
