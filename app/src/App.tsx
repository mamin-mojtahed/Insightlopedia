import React, { useEffect, useState, useMemo } from 'react';
import './App.css';
import { Quote, Figure } from './types';
import { fetchQuotes, fetchFigures } from './services/api';
import { TagBar } from './components/TagBar';
import { QuoteCard } from './components/QuoteCard';

function App() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [figures, setFigures] = useState<Figure[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
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

  const tags = useMemo(() => {
    return Array.from(new Set(quotes.flatMap(q => q.tags))).sort();
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    if (!selectedTag) return quotes;
    return quotes.filter(quote => quote.tags.includes(selectedTag));
  }, [quotes, selectedTag]);

  const figureMap = useMemo(() => {
    const map = new Map<number, Figure>();
    figures.forEach(figure => map.set(figure.id, figure));
    return map;
  }, [figures]);

  return (
    <div className="App">
      <TagBar
        tags={tags}
        selectedTag={selectedTag}
        onSelectTag={(tag) => setSelectedTag(tag)}
      />

      {error && <div className="error-message" style={{ color: 'red', margin: '20px' }}>{error}</div>}

      {isLoading ? (
        <p style={{ margin: '40px', fontSize: '1.2em' }}>Loading insights...</p>
      ) : (
        filteredQuotes.map(quote => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            figure={figureMap.get(quote.figure_id)}
            selectedTag={selectedTag}
            onSelectTag={(tag) => setSelectedTag(tag)}
          />
        ))
      )}
    </div>
  );
}

export default App;
