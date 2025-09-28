import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple test to verify Jest setup is working
describe('Jest Setup Test', () => {
  it('should render and find text', () => {
    render(<div>Hello World</div>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should pass basic test', () => {
    expect(2 + 2).toBe(4);
  });
});