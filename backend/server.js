const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const { addQuote } = require('./addQuote');
const { deleteQuote } = require('./deleteQuote');

const app = express();
const port = process.env.PORT || 3001;
const dbPath = path.join(__dirname, 'test.db');

// Middleware
app.use(express.json());
app.use(cors());

// Initialize SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log(`Connected to SQLite database at ${dbPath}`);
  }
});

// Non-destructive table initialization
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS figures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT,
      lastName TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      figure_id INTEGER,
      text TEXT,
      tags TEXT
    )
  `);

  // Seed default figures only if table is empty
  db.get('SELECT COUNT(*) as count FROM figures', (err, row) => {
    if (err) {
      console.error('Error checking figures count:', err.message);
      return;
    }
    if (row.count === 0) {
      console.log('Seeding initial figures...');
      const figureStmt = db.prepare('INSERT INTO figures (firstName, lastName) VALUES (?, ?)');
      const initialFigures = [
        { firstName: 'Sadhguru', lastName: '' },
        { firstName: 'Jordan', lastName: 'Peterson' }
      ];
      initialFigures.forEach(figure => {
        figureStmt.run(figure.firstName, figure.lastName);
      });
      figureStmt.finalize();
    }
  });

  // Seed default quotes only if table is empty
  db.get('SELECT COUNT(*) as count FROM quotes', (err, row) => {
    if (err) {
      console.error('Error checking quotes count:', err.message);
      return;
    }
    if (row.count === 0) {
      console.log('Seeding initial quotes...');
      const quoteStmt = db.prepare('INSERT INTO quotes (figure_id, text, tags) VALUES (?, ?, ?)');
      const initialQuotes = [
        { figure_id: 1, text: "A friend is someone brave enough to tell you you're shit while still wanting to be with you.", tags: ['friendship', 'criticism'] },
        { figure_id: 2, text: "A friend is someone who's willing to suffer with you and cheer with you all the way.", tags: ['friendship', 'sympathy'] },
        { figure_id: 1, text: 'The sign of intelligence is that you are constantly wondering. Idiots are always dead sure about every damn thing they are doing in their life.', tags: ['intelligence', 'wisdom'] },
        { figure_id: 1, text: 'If you resist change, you resist life.', tags: ['change', 'life'] },
        { figure_id: 1, text: 'The fear is simply because you are not living with life, you are living in your mind.', tags: ['fear', 'mind'] },
        { figure_id: 1, text: 'The most beautiful moments in life are moments when you are expressing your joy, not when you are seeking it.', tags: ['joy', 'life'] },
        { figure_id: 2, text: 'Compare yourself to who you were yesterday, not to who someone else is today.', tags: ['comparison', 'self-improvement'] },
        { figure_id: 2, text: 'You’re going to pay a price for every bloody thing you do and everything you don’t do.', tags: ['choices', 'consequences'] },
        { figure_id: 2, text: 'Work as hard as you possibly can on at least one thing and see what happens.', tags: ['hard work', 'success'] },
        { figure_id: 2, text: 'If you fulfill your obligations every day you don’t need to worry about the future.', tags: ['responsibility', 'future'] },
        { figure_id: 1, text: 'Do not try to fix whatever comes in your life. Fix yourself in such a way that whatever comes, you will be fine.', tags: ['self-improvement', 'life'] },
        { figure_id: 1, text: 'If you want to be successful, don’t seek success – seek competence, empowerment; do nothing short of the best that you can do.', tags: ['success', 'competence'] }
      ];

      initialQuotes.forEach(quote => {
        const tagString = Array.isArray(quote.tags) ? quote.tags.join(',') : quote.tags;
        quoteStmt.run(quote.figure_id, quote.text, tagString);
      });
      quoteStmt.finalize();
    }
  });
});

// Endpoint: get quotes by tag
app.get('/quotes', (req, res) => {
  const tag = req.query.tag;
  const query = tag ? 'SELECT * FROM quotes WHERE tags LIKE ?' : 'SELECT * FROM quotes';
  const params = tag ? [`%${tag}%`] : [];
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ quotes: rows });
  });
});

// Endpoint: add quote
app.post('/quotes', (req, res) => {
  const { text, author, tags } = req.body;
  addQuote(db, { text, author, tags }, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(201).json(result);
  });
});

// Endpoint: delete quote
app.delete('/quotes/:id', (req, res) => {
  const { id } = req.params;
  deleteQuote(db, id, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!result.deleted) {
      res.status(404).json({ error: 'Quote not found' });
      return;
    }
    res.json({ message: 'Quote deleted successfully', id: result.id, quote: result.quote });
  });
});

// Endpoint: get all figures
app.get('/figures', (req, res) => {
  db.all('SELECT * FROM figures', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ figures: rows });
  });
});

// Endpoint: health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
