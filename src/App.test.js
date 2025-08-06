import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders game title', () => {
  render(<App />);
  expect(screen.getByText(/^Deal or No Deal!$/i)).toBeInTheDocument();
});
