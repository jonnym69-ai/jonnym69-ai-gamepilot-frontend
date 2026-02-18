const sqlite3 = require('sqlite3').verbose();

const dbPath = './gamepilot.db';

// Open database connection
const db = new sqlite3.Database(dbPath);

// Check Stronghold Crusader moods
db.all('SELECT id, title, moods FROM games WHERE title LIKE "%Stronghold%"', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('🔍 Stronghold games:');
    if (rows.length === 0) {
      console.log('❌ No Stronghold games found');
    } else {
      rows.forEach(row => {
        console.log(`  - ${row.title}:`);
        console.log(`    ID: ${row.id}`);
        console.log(`    Moods: ${JSON.stringify(row.moods)}`);
      });
    }
  }
  db.close();
});
