const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const AUXILIARY_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'nor', 'so', 'yet', 'if', 'as', 'than',
  'because', 'while', 'though', 'although', 'either', 'neither', 'in', 'on', 'at',
  'to', 'for', 'of', 'with', 'by', 'from', 'up', 'down', 'about', 'into', 'over',
  'after', 'beneath', 'under', 'above', 'between', 'through', 'off', 'i', 'me',
  'my', 'myself', 'we', 'us', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'this', 'that', 'these', 'those', 'who', 'whom', 'whose', 'which', 'what',
  'whatever', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'done', 'can', 'could',
  'will', 'would', 'shall', 'should', 'may', 'might', 'must', "you're", "you’re",
  "it's", "it’s", "he's", "he’s", "she's", "she’s", "that's", "that’s", "what's",
  "what’s", "don't", "don’t", "doesn't", "doesn’t", "didn't", "didn’t", "can't",
  "can’t", "won't", "won’t", "not", "no", "too", "very", "just", "only", "also",
  "all", "any", "every"
]);

function extractTopics(text) {
  if (!text) return [];
  const words = text
    .split(/[^a-zA-Z0-9'’-]+/g)
    .map(w => w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').toLowerCase())
    .filter(w => w.length >= 3 && !AUXILIARY_WORDS.has(w));

  return Array.from(new Set(words)).slice(0, 5);
}

function addQuote(dbInstance, { text, author, tags }, callback) {
  if (!text || !text.trim()) {
    return callback(new Error('Quote text is required.'));
  }
  if (!author || !author.trim()) {
    return callback(new Error('Author is required.'));
  }

  const trimmedText = text.trim();
  const trimmedAuthor = author.trim();

  // Parse author into firstName and lastName
  let firstName = trimmedAuthor;
  let lastName = '';
  const spaceIdx = trimmedAuthor.indexOf(' ');
  if (spaceIdx !== -1) {
    firstName = trimmedAuthor.substring(0, spaceIdx).trim();
    lastName = trimmedAuthor.substring(spaceIdx + 1).trim();
  }

  // Parse tags or extract topics automatically
  let tagArray = [];
  if (Array.isArray(tags)) {
    tagArray = tags.map(t => String(t).trim().toLowerCase()).filter(Boolean);
  } else if (typeof tags === 'string' && tags.trim().length > 0) {
    tagArray = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  }

  if (tagArray.length === 0) {
    tagArray = extractTopics(trimmedText);
  }

  tagArray = Array.from(new Set(tagArray));
  const tagString = tagArray.join(',');

  const findFigureSql = `
    SELECT id, firstName, lastName FROM figures
    WHERE (TRIM(firstName || ' ' || lastName) = ? COLLATE NOCASE)
       OR (firstName = ? AND lastName = ? COLLATE NOCASE)
       OR (firstName = ? AND (lastName IS NULL OR lastName = '') COLLATE NOCASE)
    LIMIT 1
  `;

  dbInstance.get(findFigureSql, [trimmedAuthor, firstName, lastName, trimmedAuthor], (err, existingFigure) => {
    if (err) return callback(err);

    const insertQuoteRecord = (figureId, finalFigure) => {
      const insertSql = 'INSERT INTO quotes (figure_id, text, tags) VALUES (?, ?, ?)';
      dbInstance.run(insertSql, [figureId, trimmedText, tagString], function(quoteErr) {
        if (quoteErr) return callback(quoteErr);

        const newQuote = {
          id: this.lastID,
          figure_id: figureId,
          text: trimmedText,
          tags: tagArray
        };
        callback(null, { quote: newQuote, figure: finalFigure });
      });
    };

    if (existingFigure) {
      insertQuoteRecord(existingFigure.id, existingFigure);
    } else {
      const insertFigureSql = 'INSERT INTO figures (firstName, lastName) VALUES (?, ?)';
      dbInstance.run(insertFigureSql, [firstName, lastName], function(figureErr) {
        if (figureErr) return callback(figureErr);

        const newFigure = {
          id: this.lastID,
          firstName,
          lastName
        };
        insertQuoteRecord(newFigure.id, newFigure);
      });
    }
  });
}

module.exports = {
  extractTopics,
  addQuote
};
