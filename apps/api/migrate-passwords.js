const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'gamepilot.db');
const db = new sqlite3.Database(dbPath);

async function migratePasswords() {
  console.log('🔍 Checking existing users...');
  
  // Get all users
  db.all('SELECT id, username FROM users', async (err, users) => {
    if (err) {
      console.error('❌ Error fetching users:', err);
      return;
    }
    
    console.log(`📊 Found ${users.length} users`);
    
    for (const user of users) {
      // Check if user already has a password
      db.get('SELECT userId FROM passwords WHERE userId = ?', [user.id], async (err, passwordRow) => {
        if (err) {
          console.error('❌ Error checking password:', err);
          return;
        }
        
        if (!passwordRow) {
          // Add default password for existing users
          const defaultPassword = 'password123';
          const hashedPassword = await bcrypt.hash(defaultPassword, 12);
          
          db.run('INSERT INTO passwords (userId, passwordHash) VALUES (?, ?)', [user.id, hashedPassword], (err) => {
            if (err) {
              console.error(`❌ Error adding password for ${user.username}:`, err);
            } else {
              console.log(`✅ Added default password for user: ${user.username} (password: ${defaultPassword})`);
            }
          });
        } else {
          console.log(`ℹ️ User ${user.username} already has a password`);
        }
      });
    }
    
    // Close connection after a delay
    setTimeout(() => {
      db.close();
      console.log('🔐 Password migration completed');
    }, 2000);
  });
}

migratePasswords();
