const sqlite3 = require('sqlite3').verbose();

const dbPath = './gamepilot.db';

async function fixStrongholdMoods() {
  console.log('🔧 Fixing Stronghold Crusader moods...');
  
  try {
    // Update Stronghold Crusader to only have 'strategic' mood
    const result = await new Promise((resolve, reject) => {
      db.run(
        'UPDATE games SET moods = ? WHERE title LIKE "%Stronghold Crusader%"',
        [JSON.stringify(['strategic'])],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });

    console.log('✅ Updated Stronghold Crusader moods to: ["strategic"]');
    
    // Also update Stronghold: Definitive Edition
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE games SET moods = ? WHERE title LIKE "%Stronghold: Definitive Edition%"',
        [JSON.stringify(['strategic'])],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });

    console.log('✅ Updated Stronghold: Definitive Edition moods to: ["strategic"]');
    
    console.log('🎮 Stronghold games will now only appear for "strategic" mood filter!');
    
  } catch (error) {
    console.error('❌ Error fixing Stronghold moods:', error);
  }
}

// Open database connection
const db = new sqlite3.Database(dbPath);

// Run the fix
fixStrongholdMoods().then(() => {
  db.close();
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  db.close();
  process.exit(1);
});
