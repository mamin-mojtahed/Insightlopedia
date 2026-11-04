import React from 'react';
import { Quote, Figure } from '../types';

interface QuoteCardProps {
  quote: Quote;
  figure?: Figure;
  selectedTag: string | null;
  onSelectTag: (tag: string) => void;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  figure,
  selectedTag,
  onSelectTag
}) => {
  const fullName = figure ? `${figure.firstName} ${figure.lastName}`.trim() : '';

  return (
    <div className="quoteholder">
      {fullName && <h3 className="figure-name">{fullName}</h3>}
      <div className="quote">
        <p><strong>{quote.text}</strong></p>
        <div className="tags">
          {quote.tags.map(tag => (
            <button
              key={tag}
              type="button"
              className={`tag-button ${selectedTag === tag ? 'selected' : ''}`}
              onClick={() => onSelectTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

