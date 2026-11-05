import React, { useMemo } from 'react';
import { Quote, Figure } from '../types';
import { tokenizeQuote } from '../utils/textUtils';

interface QuoteCardProps {
  quote: Quote;
  figure?: Figure;
  selectedTag: string | null;
  onSelectTag: (tag: string) => void;
  activeWord?: string | null;
  onSelectWord?: (word: string) => void;
  onSelectFigure?: (figureName: string) => void;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  figure,
  selectedTag,
  onSelectTag,
  activeWord,
  onSelectWord,
  onSelectFigure
}) => {
  const fullName = figure ? `${figure.firstName} ${figure.lastName}`.trim() : '';

  const tokens = useMemo(() => {
    return tokenizeQuote(quote.text);
  }, [quote.text]);

  const normalizedActiveWord = (activeWord || '').trim().toLowerCase();
  const isFigureActive =
    normalizedActiveWord.length > 0 &&
    fullName.toLowerCase() === normalizedActiveWord;

  return (
    <div className="quoteholder">
      {fullName && (
        <h3
          className={`figure-name ${onSelectFigure ? 'tappable-figure' : ''} ${isFigureActive ? 'active' : ''}`}
          role={onSelectFigure ? 'button' : undefined}
          tabIndex={onSelectFigure ? 0 : undefined}
          title={onSelectFigure ? `Filter quotes by ${fullName}` : undefined}
          aria-label={onSelectFigure ? `Filter quotes by ${fullName}` : undefined}
          onClick={() => onSelectFigure?.(fullName)}
          onKeyDown={(e) => {
            if (onSelectFigure && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onSelectFigure(fullName);
            }
          }}
        >
          {fullName}
        </h3>
      )}
      <div className="quote">
        <p>
          <strong>
            {tokens.map((token, index) => {
              if (!token.isWord || token.isAuxiliary || !onSelectWord) {
                return <span key={index}>{token.raw}</span>;
              }

              const isMatch =
                normalizedActiveWord.length > 0 &&
                token.cleanWord === normalizedActiveWord;

              return (
                <span
                  key={index}
                  role="button"
                  tabIndex={0}
                  className={`tappable-word ${isMatch ? 'active' : ''}`}
                  title={`Filter quotes by "${token.cleanWord}"`}
                  aria-label={`Filter quotes by ${token.cleanWord}`}
                  onClick={() => onSelectWord(token.cleanWord)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectWord(token.cleanWord);
                    }
                  }}
                >
                  {token.raw}
                </span>
              );
            })}
          </strong>
        </p>
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

export default QuoteCard;
