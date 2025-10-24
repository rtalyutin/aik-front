import { render, screen } from '@testing-library/react';
import App from './App.jsx';

describe('App', () => {
  it('renders feature list', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /welcome to aik front/i })).toBeInTheDocument();
    expect(screen.getByText(/vite for fast builds/i)).toBeInTheDocument();
    expect(screen.getByText(/react 18 with strict mode/i)).toBeInTheDocument();
    expect(screen.getByText(/testing library/i)).toBeInTheDocument();
  });
});
