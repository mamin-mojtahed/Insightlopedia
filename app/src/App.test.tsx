import React, { act } from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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

describe('App unified filtering and quote addition', () => {
  beforeEach(() => {
    (api.fetchQuotes as jest.Mock).mockResolvedValue(mockQuotes);
    (api.fetchFigures as jest.Mock).mockResolvedValue(mockFigures);
    (api.createQuote as jest.Mock).mockResolvedValue({
      quote: {
        id: 3,
        figure_id: 3,
        text: 'Know thyself.',
        tags: ['philosophy', 'wisdom']
      },
      figure: {
        id: 3,
        firstName: 'Socrates',
        lastName: ''
      }
    });
    (api.deleteQuote as jest.Mock).mockResolvedValue({
      message: 'Quote deleted successfully',
      id: 1
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders ALL tag button, search bar, and add quote plus button', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/ALL/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search quotes, figures, or topics/i)).toBeInTheDocument();
    expect(screen.getByTitle(/add quote/i)).toBeInTheDocument();
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

  test('clicking the plus button opens the add quote modal and submits a new quote', async () => {
    await act(async () => {
      render(<App />);
    });

    const addBtn = screen.getByTitle(/add quote/i);
    fireEvent.click(addBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/add new quote/i)).toBeInTheDocument();

    const quoteInput = screen.getByPlaceholderText(/enter timeless words or insight/i);
    const authorInput = screen.getByPlaceholderText(/e\.g\. Marcus Aurelius/i);
    const tagsInput = screen.getByPlaceholderText(/e\.g\. wisdom, stoicism, life/i);

    fireEvent.change(quoteInput, { target: { value: 'Know thyself.' } });
    fireEvent.change(authorInput, { target: { value: 'Socrates' } });
    fireEvent.change(tagsInput, { target: { value: 'philosophy, wisdom' } });

    await act(async () => {
      const submitBtn = within(dialog).getByRole('button', { name: /add quote/i });
      fireEvent.click(submitBtn);
    });

    expect(api.createQuote).toHaveBeenCalledWith({
      text: 'Know thyself.',
      author: 'Socrates',
      tags: 'philosophy, wisdom'
    });

    await waitFor(() => {
      expect(screen.getByText('Know')).toBeInTheDocument();
      expect(screen.getByText('thyself')).toBeInTheDocument();
      expect(screen.getByText('Socrates')).toBeInTheDocument();
    });
  });

  test('clicking subtle delete button displays confirmation prompt and cancel dismisses it', async () => {
    await act(async () => {
      render(<App />);
    });

    const deleteBtns = screen.getAllByTitle(/delete quote/i);
    expect(deleteBtns.length).toBe(2);

    // Click delete on the first quote
    fireEvent.click(deleteBtns[0]);

    expect(screen.getByText('Delete?')).toBeInTheDocument();
    const cancelBtn = screen.getByRole('button', { name: /cancel delete quote/i });
    const confirmBtn = screen.getByRole('button', { name: /confirm delete quote/i });
    expect(cancelBtn).toBeInTheDocument();
    expect(confirmBtn).toBeInTheDocument();

    // Cancel deletion
    fireEvent.click(cancelBtn);
    expect(screen.queryByText('Delete?')).not.toBeInTheDocument();
    expect(api.deleteQuote).not.toHaveBeenCalled();
    expect(screen.getByText('brave')).toBeInTheDocument();
  });

  test('confirming delete calls deleteQuote and removes the quote from list', async () => {
    await act(async () => {
      render(<App />);
    });

    const deleteBtns = screen.getAllByTitle(/delete quote/i);
    fireEvent.click(deleteBtns[0]);

    const confirmBtn = screen.getByRole('button', { name: /confirm delete quote/i });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(api.deleteQuote).toHaveBeenCalledWith(1);
    await waitFor(() => {
      expect(screen.queryByText('brave')).not.toBeInTheDocument();
    });
    // Second quote remains
    expect(screen.getByText('Resist')).toBeInTheDocument();
  });
});
