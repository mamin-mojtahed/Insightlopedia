#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const readline = require('readline');

function deleteQuote(dbInstance, id, callback) {
  if (!id || isNaN(Number(id))) {
    return callback(new Error('A valid quote ID is required.'));
  }
  const numericId = Number(id);

  dbInstance.get(
    `SELECT q.id, q.text, q.tags, f.firstName, f.lastName
     FROM quotes q
     LEFT JOIN figures f ON q.figure_id = f.id
     WHERE q.id = ?`,
    [numericId],
    (err, quote) => {
      if (err) return callback(err);
      if (!quote) {
        return callback(null, { deleted: false, id: numericId });
      }

      dbInstance.run('DELETE FROM quotes WHERE id = ?', [numericId], function(delErr) {
        if (delErr) return callback(delErr);
        callback(null, {
          deleted: true,
          id: numericId,
          quote: {
            id: quote.id,
            text: quote.text,
            tags: quote.tags ? quote.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            author: `${quote.firstName || ''} ${quote.lastName || ''}`.trim()
          }
        });
      });
    }
  );
}

function runDeleteCli(args = process.argv.slice(2)) {
  const dbPath = path.join(__dirname, 'test.db');
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Failed to connect to database:', err.message);
      process.exit(1);
    }
  });

  let targetId = null;
  let force = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--id' || arg === '-i' || arg === '--delete' || arg === '-d') {
      targetId = args[++i];
    } else if (arg === '--yes' || arg === '-y' || arg === '--force' || arg === '-f') {
      force = true;
    } else if (!arg.startsWith('-') && !targetId && !isNaN(Number(arg))) {
      targetId = arg;
    }
  }

  const performDelete = (id) => {
    deleteQuote(db, id, (err, result) => {
      if (err) {
        console.error('\nError deleting quote:', err.message);
        db.close();
        process.exit(1);
      }
      if (!result.deleted) {
        console.log(`\nQuote with ID ${id} not found.\n`);
      } else {
        console.log(`\n✓ Quote ${id} successfully deleted from Insightlopedia!`);
        console.log(`  Deleted Quote: "${result.quote.text}"`);
        if (result.quote.author) {
          console.log(`  Author:        ${result.quote.author}`);
        }
        console.log('');
      }
      db.close();
    });
  };

  const confirmAndDelete = (id) => {
    db.get(
      `SELECT q.id, q.text, f.firstName, f.lastName
       FROM quotes q
       LEFT JOIN figures f ON q.figure_id = f.id
       WHERE q.id = ?`,
      [Number(id)],
      (err, quote) => {
        if (err) {
          console.error('\nError querying quote:', err.message);
          db.close();
          process.exit(1);
        }
        if (!quote) {
          console.log(`\nQuote with ID ${id} not found.\n`);
          db.close();
          return;
        }

        const author = `${quote.firstName || ''} ${quote.lastName || ''}`.trim();
        console.log(`\nFound Quote #${quote.id}:`);
        console.log(`  "${quote.text}"`);
        if (author) console.log(`  — ${author}`);

        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        rl.question('\nAre you sure you want to delete this quote? (y/N): ', (answer) => {
          rl.close();
          if (answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes') {
            performDelete(id);
          } else {
            console.log('Deletion cancelled.\n');
            db.close();
          }
        });
      }
    );
  };

  if (targetId) {
    if (force) {
      performDelete(targetId);
    } else {
      confirmAndDelete(targetId);
    }
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n--- Insightlopedia: Delete Quote ---');
    rl.question('Enter the ID of the quote to delete: ', (input) => {
      rl.close();
      const trimmed = input.trim();
      if (!trimmed || isNaN(Number(trimmed))) {
        console.error('Error: Please provide a valid numeric quote ID.');
        db.close();
        process.exit(1);
      }
      confirmAndDelete(trimmed);
    });
  }
}

if (require.main === module) {
  runDeleteCli();
}

module.exports = {
  deleteQuote,
  runDeleteCli
};
