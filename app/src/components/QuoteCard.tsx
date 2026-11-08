import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
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
  onDeleteQuote?: (id: number) => Promise<void> | void;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  figure,
  selectedTag,
  onSelectTag,
  activeWord,
  onSelectWord,
  onSelectFigure,
  onDeleteQuote
}) => {
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isConfirming) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setIsConfirming(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsConfirming(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isConfirming]);

  const handleConfirmDelete = async () => {
    if (!onDeleteQuote) return;
    try {
      setIsDeleting(true);
      await onDeleteQuote(quote.id);
    } catch {
      setIsDeleting(false);
      setIsConfirming(false);
    }
  };

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

      {onDeleteQuote && (
        <div className="quote-actions" ref={actionsRef}>
          {isConfirming ? (
            <div className="quote-delete-confirm" role="group" aria-label="Confirm deletion">
              <span className="confirm-prompt">Delete?</span>
              <button
                type="button"
                className="confirm-btn yes"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                aria-label="Confirm delete quote"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                type="button"
                className="confirm-btn cancel"
                onClick={() => setIsConfirming(false)}
                disabled={isDeleting}
                aria-label="Cancel delete quote"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="quote-delete-btn"
              onClick={() => setIsConfirming(true)}
              aria-label="Delete quote"
              title="Delete quote"
            >
              <Trash2 size={15} strokeWidth={1.8} />
            </button>
          )}
        </div>
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
