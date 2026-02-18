const sqlite3 = require('sqlite3').verbose();

const dbPath = './gamepilot.db';

async function checkDatabase() {
  console.log('🔍 Checking database structure...');
  
  try {
    // Get all tables
    const tables = await new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    console.log('📋 Available tables:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });

    // Check if games table exists and get sample data
    if (tables.some(t => t.name === 'games')) {
      const sampleGames = await new Promise((resolve, reject) => {
        db.all('SELECT id, title, moods FROM games LIMIT 5', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });

      console.log('\n🎮 Sample games:');
      sampleGames.forEach(game => {
        console.log(`  - ${game.title}: ${game.moods || 'No moods'}`);
      });
    }

    // Check user_games table
    if (tables.some(t => t.name === 'user_games')) {
      const userGames = await new Promise((resolve, reject) => {
        db.all('SELECT COUNT(*) as count FROM user_games', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows[0].count);
          }
        });
      });

      console.log(`\n👥 User games count: ${userGames}`);
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

// Open database connection
const db = new sqlite3.Database(dbPath);

// Run the check
checkDatabase().then(() => {
  db.close();
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  db.close();
  process.exit(1);
});
