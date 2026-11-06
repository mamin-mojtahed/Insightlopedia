import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';
import * as api from './services/api';

jest.mock('./services/api');

const mockQuotes = [
  {
    id: 1,
    figure_id: 1,
    text: 'A friend is brave.',
    tags: ['friendship', 'criticism']
  },
  {
    id: 2,
    figure_id: 2,
    text: 'Resist change.',
    tags: ['change', 'life']
  }
];

const mockFigures = [
  { id: 1, firstName: 'Sadhguru', lastName: '' },
  { id: 2, firstName: 'Jordan', lastName: 'Peterson' }
];

describe('App unified filtering', () => {
  beforeEach(() => {
    (api.fetchQuotes as jest.Mock).mockResolvedValue(mockQuotes);
    (api.fetchFigures as jest.Mock).mockResolvedValue(mockFigures);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders ALL tag button and search bar', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/ALL/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search quotes, figures, or topics/i)).toBeInTheDocument();
  });

  test('tapping a topic tag prepopulates the search bar and toggling it clears it', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('friendship').length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByPlaceholderText(/search quotes, figures, or topics/i) as HTMLInputElement;
    const topicButton = screen.getAllByText('friendship')[0];

    // Tap topic -> prepopulates search bar
    fireEvent.click(topicButton);
    expect(searchInput.value).toBe('friendship');

    // Tap same topic again -> clears search bar
    fireEvent.click(topicButton);
    expect(searchInput.value).toBe('');
  });

  test('tapping ALL clears the search bar', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getAllByText('change').length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByPlaceholderText(/search quotes, figures, or topics/i) as HTMLInputElement;
    const changeButton = screen.getAllByText('change')[0];
    const allButton = screen.getByText(/ALL/i);

    fireEvent.click(changeButton);
    expect(searchInput.value).toBe('change');

    fireEvent.click(allButton);
    expect(searchInput.value).toBe('');
  });

  test('tapping a figure name prepopulates search bar and toggling it clears it', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Sadhguru')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search quotes, figures, or topics/i) as HTMLInputElement;
    const figureHeading = screen.getByText('Sadhguru');

    fireEvent.click(figureHeading);
    expect(searchInput.value).toBe('Sadhguru');

    fireEvent.click(figureHeading);
    expect(searchInput.value).toBe('');
  });

  test('tapping a word in a quote prepopulates search bar and toggling it clears it', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('brave')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search quotes, figures, or topics/i) as HTMLInputElement;
    const braveWord = screen.getByText('brave');

    fireEvent.click(braveWord);
    expect(searchInput.value).toBe('brave');

    fireEvent.click(braveWord);
    expect(searchInput.value).toBe('');
  });
});
