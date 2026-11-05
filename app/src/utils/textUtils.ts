/**
 * Set of common auxiliary, modal, pronoun, preposition, and function words (stopwords)
 * in lowercase. Words in this set will remain non-tappable so that only meaningful,
 * content-rich words can be tapped to filter insights.
 */
export const AUXILIARY_WORDS = new Set([
  // Articles
  'a',
  'an',
  'the',

  // Conjunctions
  'and',
  'or',
  'but',
  'nor',
  'so',
  'yet',
  'if',
  'as',
  'than',
  'because',
  'while',
  'though',
  'although',
  'either',
  'neither',

  // Prepositions
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'up',
  'down',
  'about',
  'into',
  'over',
  'after',
  'beneath',
  'under',
  'above',
  'between',
  'through',
  'off',

  // Pronouns & Demonstratives
  'i',
  'me',
  'my',
  'myself',
  'we',
  'us',
  'our',
  'ours',
  'ourselves',
  'you',
  'your',
  'yours',
  'yourself',
  'yourselves',
  'he',
  'him',
  'his',
  'himself',
  'she',
  'her',
  'hers',
  'herself',
  'it',
  'its',
  'itself',
  'they',
  'them',
  'their',
  'theirs',
  'themselves',
  'this',
  'that',
  'these',
  'those',
  'who',
  'whom',
  'whose',
  'which',
  'what',
  'whatever',

  // Auxiliary, Modal, and Copular Verbs
  'is',
  'am',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'having',
  'do',
  'does',
  'did',
  'doing',
  'done',
  'can',
  'could',
  'will',
  'would',
  'shall',
  'should',
  'may',
  'might',
  'must',

  // Contractions (common auxiliary and pronoun pairs)
  "you're",
  'you’re',
  "you've",
  'you’ve',
  "you'll",
  'you’ll',
  "you'd",
  'you’d',
  "it's",
  'it’s',
  "he's",
  'he’s',
  "she's",
  'she’s',
  "that's",
  'that’s',
  "what's",
  'what’s',
  "who's",
  'who’s',
  "there's",
  'there’s',
  "here's",
  'here’s',
  "i'm",
  'i’m',
  "i've",
  'i’ve',
  "i'll",
  'i’ll',
  "i'd",
  'i’d',
  "we're",
  'we’re',
  "we've",
  'we’ve',
  "we'll",
  'we’ll',
  "they're",
  'they’re',
  "they've",
  'they’ve',
  "they'll",
  'they’ll',
  "don't",
  'don’t',
  "doesn't",
  'doesn’t',
  "didn't",
  'didn’t',
  "can't",
  'can’t',
  "won't",
  'won’t',
  "isn't",
  'isn’t',
  "aren't",
  'aren’t',
  "wasn't",
  'wasn’t',
  "weren't",
  'weren’t',
  "haven't",
  'haven’t',
  "hasn't",
  'hasn’t',
  "hadn't",
  'hadn’t',
  "wouldn't",
  'wouldn’t',
  "couldn't",
  'couldn’t',
  "shouldn't",
  'shouldn’t',

  // Common auxiliary adverbs / determiners
  'not',
  'no',
  'too',
  'very',
  'just',
  'only',
  'also',
  'all',
  'any',
  'every'
]);

export interface TextToken {
  raw: string;
  isWord: boolean;
  isAuxiliary: boolean;
  cleanWord: string;
}

/**
 * Strips punctuation and returns a sanitized keyword.
 */
export function sanitizeWord(word: string): string {
  return word.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').toLowerCase();
}

/**
 * Checks whether a word is considered an auxiliary/stop word.
 */
export function isAuxiliaryWord(word: string): boolean {
  const clean = sanitizeWord(word);
  if (!clean || clean.length <= 1) return true;
  return AUXILIARY_WORDS.has(clean);
}

/**
 * Tokenizes quote text into words and delimiters, identifying non-auxiliary words.
 */
export function tokenizeQuote(text: string): TextToken[] {
  // Matches words containing alphanumeric characters and apostrophes/hyphens
  const parts = text.split(/([a-zA-Z0-9'’-]+)/g);

  return parts.map(part => {
    if (!part) {
      return { raw: '', isWord: false, isAuxiliary: true, cleanWord: '' };
    }

    const clean = sanitizeWord(part);
    const isWord = /[a-zA-Z0-9]/.test(part);
    const isAux = !isWord || isAuxiliaryWord(part);

    return {
      raw: part,
      isWord,
      isAuxiliary: isAux,
      cleanWord: clean
    };
  }).filter(token => token.raw.length > 0);
}

