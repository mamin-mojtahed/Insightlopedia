import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ALL tag button', () => {
  render(<App />);
  const allButton = screen.getByText(/ALL/i);
  expect(allButton).toBeInTheDocument();
});

test('renders search input bar', () => {
  render(<App />);
  const searchInput = screen.getByPlaceholderText(/search quotes, figures, or topics/i);
  expect(searchInput).toBeInTheDocument();
});
