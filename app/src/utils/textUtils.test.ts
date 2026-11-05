import { isAuxiliaryWord, tokenizeQuote, sanitizeWord } from './textUtils';

describe('textUtils', () => {
  test('sanitizeWord removes surrounding punctuation', () => {
    expect(sanitizeWord('"friend!"')).toBe('friend');
    expect(sanitizeWord('change,')).toBe('change');
    expect(sanitizeWord('...wondering...')).toBe('wondering');
  });

  test('isAuxiliaryWord recognizes stopwords and auxiliary verbs', () => {
    expect(isAuxiliaryWord('is')).toBe(true);
    expect(isAuxiliaryWord('the')).toBe(true);
    expect(isAuxiliaryWord('and')).toBe(true);
    expect(isAuxiliaryWord('you')).toBe(true);
    expect(isAuxiliaryWord("you're")).toBe(true);
    expect(isAuxiliaryWord('to')).toBe(true);
    expect(isAuxiliaryWord('a')).toBe(true);
  });

  test('isAuxiliaryWord allows meaningful content words', () => {
    expect(isAuxiliaryWord('friend')).toBe(false);
    expect(isAuxiliaryWord('wondering')).toBe(false);
    expect(isAuxiliaryWord('competence')).toBe(false);
    expect(isAuxiliaryWord('brave')).toBe(false);
    expect(isAuxiliaryWord('intelligence')).toBe(false);
    expect(isAuxiliaryWord('future')).toBe(false);
  });

  test('tokenizeQuote separates words and marks non-auxiliary words as tappable', () => {
    const tokens = tokenizeQuote('A friend is brave.');
    // 'A' (auxiliary), ' ' (delimiter), 'friend' (tappable), ' ' (delimiter), 'is' (auxiliary), ' ' (delimiter), 'brave' (tappable), '.' (delimiter)
    const tappable = tokens.filter(t => t.isWord && !t.isAuxiliary);
    expect(tappable.map(t => t.cleanWord)).toEqual(['friend', 'brave']);
  });
});

