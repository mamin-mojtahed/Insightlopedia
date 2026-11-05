import React, { useEffect, useState, useMemo, useCallback } from 'react';
import './App.css';
import { Quote, Figure } from './types';
import { fetchQuotes, fetchFigures } from './services/api';
import { SearchBar } from './components/SearchBar';
import { TagBar } from './components/TagBar';
import { QuoteCard } from './components/QuoteCard';

function App() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [figures, setFigures] = useState<Figure[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
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

  const filteredQuotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return quotes.filter(quote => {
      // 1. Topic tag filter
      if (selectedTag && !quote.tags.includes(selectedTag)) {
        return false;
      }

      // 2. Search query filter
      if (query) {
        const figure = figureMap.get(quote.figure_id);
        const fullName = figure ? `${figure.firstName} ${figure.lastName}`.toLowerCase() : '';
        const textMatch = quote.text.toLowerCase().includes(query);
        const figureMatch = fullName.includes(query);
        const tagMatch = quote.tags.some(tag => tag.toLowerCase().includes(query));

        return textMatch || figureMatch || tagMatch;
      }

      return true;
    });
  }, [quotes, selectedTag, searchQuery, figureMap]);

  const handleSelectWord = useCallback((word: string) => {
    const clean = word.trim().toLowerCase();
    // Toggle: if already filtering by this exact word, clear it; otherwise filter by it
    if (searchQuery.trim().toLowerCase() === clean) {
      setSearchQuery('');
    } else {
      setSearchQuery(clean);
      setSelectedTag(null); // Clear tag filter to search globally for the tapped word
    }
  }, [searchQuery]);

  const handleSelectFigure = useCallback((figureName: string) => {
    const clean = figureName.trim().toLowerCase();
    if (searchQuery.trim().toLowerCase() === clean) {
      setSearchQuery('');
    } else {
      setSearchQuery(figureName.trim());
      setSelectedTag(null);
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
          selectedTag={selectedTag}
          onSelectTag={(tag) => setSelectedTag(tag)}
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
            selectedTag={selectedTag}
            onSelectTag={(tag) => setSelectedTag(tag)}
            activeWord={searchQuery}
            onSelectWord={handleSelectWord}
            onSelectFigure={handleSelectFigure}
          />
        ))
      ) : (
        <div className="no-results">
          <p>
            No quotes found
            {searchQuery ? ` matching "${searchQuery}"` : ''}
            {selectedTag ? ` in topic "${selectedTag}"` : ''}.
          </p>
          <button
            type="button"
            className="reset-button"
            onClick={() => {
              setSearchQuery('');
              setSelectedTag(null);
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
