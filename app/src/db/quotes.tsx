import React from 'react';
import { Quote as QuoteType } from '../types';

export type QuoteProps = QuoteType & {
  onSelectTag?: (tag: string) => void;
};

export const Quote: React.FC<QuoteProps> = ({ text, tags, onSelectTag }) => {
  return (
    <div className="quote">
      <p><strong>{text}</strong></p>
      <div className="tags">
        {tags.map(tag => (
          <button
            key={tag}
            type="button"
            className="tag-button"
            style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
            onClick={() => onSelectTag?.(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Quote;
