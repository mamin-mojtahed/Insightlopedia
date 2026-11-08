import React from 'react';
import { Search, X, Plus } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onAddQuote?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search quotes, figures, or topics...',
  onAddQuote
}) => {
  return (
    <div className="search-bar-row">
      {onAddQuote && (
        <button
          type="button"
          className="add-quote-btn"
          onClick={onAddQuote}
          aria-label="Add quote"
          title="Add quote"
        >
          <Plus size={20} />
        </button>
      )}
      <div className="search-bar-wrapper">
        <Search className="search-icon" size={18} aria-hidden="true" />
        <input
          type="text"
          className="search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search quotes, figures, or topics"
        />
        {value && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onChange('')}
            aria-label="Clear search text"
            title="Clear search"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
