import React, { useState } from 'react';
import logo from './logo.svg';
import './db/figures';
import './db/quotes';
import './App.css';
import { Quote } from './db/quotes';

import { Figure, FigureProps } from './db/figures';

const figures: FigureProps[] = [
  { id: 0, firstName: 'Sadhguru', lastName: '' },
  { id: 1, firstName: 'Jordan', lastName: 'Peterson' }
];

const quotes = [
  { id: 0, figure_id: 0, text: 'A friend is someone brave enough to tell you you\'re shit while still wanting to be with you.', tags: ['friendship', 'criticism'] },
  { id: 1, figure_id: 1, text: 'A friend is someone who\'s willing to suffer with you and cheer with you all the way.', tags: ['friendship', 'sympathy'] },
  { id: 2, figure_id: 0, text: 'The sign of intelligence is that you are constantly wondering. Idiots are always dead sure about every damn thing they are doing in their life.', tags: ['intelligence', 'wisdom'] },
  { id: 3, figure_id: 0, text: 'If you resist change, you resist life.', tags: ['change', 'life'] },
  { id: 4, figure_id: 0, text: 'The fear is simply because you are not living with life, you are living in your mind.', tags: ['fear', 'mind'] },
  { id: 5, figure_id: 0, text: 'The most beautiful moments in life are moments when you are expressing your joy, not when you are seeking it.', tags: ['joy', 'life'] },
  { id: 6, figure_id: 1, text: 'Compare yourself to who you were yesterday, not to who someone else is today.', tags: ['comparison', 'self-improvement'] },
  { id: 7, figure_id: 1, text: 'You’re going to pay a price for every bloody thing you do and everything you don’t do.', tags: ['choices', 'consequences'] },
  { id: 8, figure_id: 1, text: 'Work as hard as you possibly can on at least one thing and see what happens.', tags: ['hard work', 'success'] },
  { id: 9, figure_id: 1, text: 'If you fulfill your obligations every day you don’t need to worry about the future.', tags: ['responsibility', 'future'] },
  { id: 10, figure_id: 0, text: 'Do not try to fix whatever comes in your life. Fix yourself in such a way that whatever comes, you will be fine.', tags: ['self-improvement', 'life'] },
  { id: 11, figure_id: 0, text: 'If you want to be successful, don’t seek success – seek competence, empowerment; do nothing short of the best that you can do.', tags: ['success', 'competence'] }
];

const tags = Array.from(new Set(quotes.flatMap(quote => quote.tags)));

function App() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const filteredQuotes = selectedTag
    ? quotes.filter(quote => quote.tags.includes(selectedTag))
    : quotes;

  return (
    <div className="App">
      <div className="tag-bar">
        <button
          className={`tag-button ${selectedTag === null ? 'selected' : ''}`}
          onClick={() => setSelectedTag(null)}
        >
          ALL
        </button>
        {tags.map(tag => (
          <button
            key={tag}
            className={`tag-button ${selectedTag === tag ? 'selected' : ''}`}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      {filteredQuotes.map(quote => {
        const figure = figures.find(f => f.id === quote.figure_id);
        const fullName = figure ? `${figure.firstName} ${figure.lastName}` : '';
        return (
          <div className="quoteholder" key={quote.id}>
            <h3 className="figure-name">{fullName}</h3>
            <Quote {...quote} />
          </div>
        );
      })}
    </div>
  );
}

export default App;
