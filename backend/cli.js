#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const readline = require('readline');
const { addQuote } = require('./addQuote');
const { runDeleteCli } = require('./deleteQuote');

const dbPath = path.join(__dirname, 'test.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  }
});

function parseArgs(args) {
  let quote = null;
  let author = null;
  let tags = null;
  let deleteId = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--quote' || arg === '-q') {
      quote = args[++i];
    } else if (arg === '--author' || arg === '-a') {
      author = args[++i];
    } else if (arg === '--tags' || arg === '-t') {
      tags = args[++i];
    } else if (arg === '--delete' || arg === '-d') {
      deleteId = args[++i];
    } else if (!arg.startsWith('-')) {
      if (!quote) quote = arg;
      else if (!author) author = arg;
      else if (!tags) tags = arg;
    }
  }

  return { quote, author, tags, deleteId };
}

function runInteractive() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n--- Insightlopedia: Add a New Quote ---');

  rl.question('Enter quote: ', (text) => {
    if (!text.trim()) {
      console.error('Error: Quote text cannot be empty.');
      rl.close();
      db.close();
      process.exit(1);
    }

    rl.question('Enter author: ', (author) => {
      if (!author.trim()) {
        console.error('Error: Author cannot be empty.');
        rl.close();
        db.close();
        process.exit(1);
      }

      rl.question('Enter topics/tags (optional, comma-separated): ', (tags) => {
        rl.close();
        saveQuote({ text, author, tags });
      });
    });
  });
}

function saveQuote({ text, author, tags }) {
  addQuote(db, { text, author, tags }, (err, result) => {
    if (err) {
      console.error('\nError adding quote:', err.message);
      db.close();
      process.exit(1);
    }

    const { quote, figure } = result;
    const figureName = `${figure.firstName} ${figure.lastName}`.trim();

    console.log('\n✓ Quote successfully added to Insightlopedia!');
    console.log(`  ID:     ${quote.id}`);
    console.log(`  Quote:  "${quote.text}"`);
    console.log(`  Author: ${figureName} (Figure ID: ${figure.id})`);
    console.log(`  Topics: ${quote.tags.join(', ') || '(none)'}\n`);

    db.close();
  });
}

const args = process.argv.slice(2);
const firstArg = args[0] ? args[0].toLowerCase() : '';

if (firstArg === 'delete' || args.includes('--delete') || args.includes('-d')) {
  // Pass arguments without the leading 'delete' subcommand keyword if present
  const deleteArgs = firstArg === 'delete' ? args.slice(1) : args;
  runDeleteCli(deleteArgs);
} else {
  const addArgs = firstArg === 'add' ? args.slice(1) : args;
  const parsed = parseArgs(addArgs);

  if (parsed.quote && parsed.author) {
    saveQuote({ text: parsed.quote, author: parsed.author, tags: parsed.tags });
  } else {
    runInteractive();
  }
}
