import React, { useEffect, useState, useMemo, useCallback } from 'react';
import './App.css';
import type { Quote, Figure } from './types';
import { fetchQuotes, fetchFigures } from './services/api';
import { SearchBar } from './components/SearchBar';
import { TagBar } from './components/TagBar';
import { QuoteCard } from './components/QuoteCard';

function App() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [figures, setFigures] = useState<Figure[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([fetchQuotes(), fetchFigures()])
      .then(([quotesData, figuresData]) => {
        if (!isMounted) return;
        setQuotes(quotesData);
        setFigures(figuresData);
        setIsLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to load data');
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const figureMap = useMemo(() => {
    const map = new Map<number, Figure>();
    figures.forEach(figure => map.set(figure.id, figure));
    return map;
  }, [figures]);

  const tags = useMemo(() => {
    return Array.from(new Set(quotes.flatMap(q => q.tags))).sort();
  }, [quotes]);

  // Active topic derived directly from the search query
  const activeTag = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;
    return tags.find(t => t.toLowerCase() === query) || null;
  }, [searchQuery, tags]);

  // Single unified filter driven entirely by searchQuery (no filtering within filtered)
  const filteredQuotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return quotes;

    return quotes.filter(quote => {
      const figure = figureMap.get(quote.figure_id);
      const fullName = figure ? `${figure.firstName} ${figure.lastName}`.toLowerCase() : '';
      const textMatch = quote.text.toLowerCase().includes(query);
      const figureMatch = fullName.includes(query);
      const tagMatch = quote.tags.some(tag => tag.toLowerCase().includes(query));

      return textMatch || figureMatch || tagMatch;
    });
  }, [quotes, searchQuery, figureMap]);

  // Tapping topics populates or clears the search bar
  const handleSelectTag = useCallback((tag: string | null) => {
    if (!tag) {
      setSearchQuery('');
    } else {
      const cleanTag = tag.trim();
      if (searchQuery.trim().toLowerCase() === cleanTag.toLowerCase()) {
        setSearchQuery('');
      } else {
        setSearchQuery(cleanTag);
      }
    }
  }, [searchQuery]);

  // Tapping words in quotes populates or clears the search bar
  const handleSelectWord = useCallback((word: string) => {
    const cleanWord = word.trim();
    if (searchQuery.trim().toLowerCase() === cleanWord.toLowerCase()) {
      setSearchQuery('');
    } else {
      setSearchQuery(cleanWord);
    }
  }, [searchQuery]);

  // Tapping figure names populates or clears the search bar
  const handleSelectFigure = useCallback((figureName: string) => {
    const cleanName = figureName.trim();
    if (searchQuery.trim().toLowerCase() === cleanName.toLowerCase()) {
      setSearchQuery('');
    } else {
      setSearchQuery(cleanName);
    }
  }, [searchQuery]);

  return (
    <div className="App">
      <header className="top-nav">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search quotes, figures, or topics..."
        />
        <TagBar
          tags={tags}
          selectedTag={activeTag}
          onSelectTag={handleSelectTag}
        />
      </header>

      {error && (
        <div className="error-message" style={{ color: 'red', margin: '20px' }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <p style={{ margin: '40px', fontSize: '1.2em', fontFamily: 'Georgia, serif' }}>
          Loading insights...
        </p>
      ) : filteredQuotes.length > 0 ? (
        filteredQuotes.map(quote => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            figure={figureMap.get(quote.figure_id)}
            selectedTag={activeTag}
            onSelectTag={handleSelectTag}
            activeWord={searchQuery}
            onSelectWord={handleSelectWord}
            onSelectFigure={handleSelectFigure}
          />
        ))
      ) : (
        <div className="no-results">
          <p>
            No quotes found{searchQuery ? ` matching "${searchQuery}"` : ''}.
          </p>
          <button
            type="button"
            className="reset-button"
            onClick={() => setSearchQuery('')}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
