const sqlite3 = require('sqlite3').verbose();

const dbPath = './gamepilot.db';

async function removeCounterStrike2() {
  console.log('🗑️ Removing Counter-Strike 2 from database...');
  
  try {
    // Find all Counter-Strike 2 entries
    const games = await new Promise((resolve, reject) => {
      db.all('SELECT id, title FROM games WHERE title LIKE "%Counter-Strike 2%"', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    console.log(`🔍 Found ${games.length} Counter-Strike 2 entries:`);
    games.forEach(game => {
      console.log(`  - ID: ${game.id}, Title: ${game.title}`);
    });

    if (games.length === 0) {
      console.log('❌ No Counter-Strike 2 entries found');
      return;
    }

    // Delete from games table
    const deletePromises = games.map(game => 
      new Promise((resolve, reject) => {
        db.run('DELETE FROM games WHERE id = ?', [game.id], (err) => {
          if (err) {
            console.error(`❌ Failed to delete game ${game.id}:`, err);
            reject(err);
          } else {
            console.log(`✅ Deleted game: ${game.title}`);
            resolve();
          }
        });
      })
    );

    // Delete from user_games junction table
    const userGamePromises = games.map(game => 
      new Promise((resolve, reject) => {
        db.run('DELETE FROM user_games WHERE gameId = ?', [game.id], (err) => {
          if (err) {
            console.error(`❌ Failed to delete user game ${game.id}:`, err);
            reject(err);
          } else {
            console.log(`✅ Deleted user game: ${game.title}`);
            resolve();
          }
        });
      })
    );

    // Wait for all deletions to complete
    await Promise.all([...deletePromises, ...userGamePromises]);
    
    console.log('✅ Counter-Strike 2 removal complete!');
    console.log('🎮 Refresh your GamePilot to see the changes');
    
  } catch (error) {
    console.error('❌ Error removing Counter-Strike 2:', error);
  }
}

// Open database connection
const db = new sqlite3.Database(dbPath);

// Run the removal
removeCounterStrike2().then(() => {
  db.close();
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  db.close();
  process.exit(1);
});
