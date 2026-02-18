const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'gamepilot.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking database contents...');

// Check users
db.all('SELECT id, username FROM users', (err, users) => {
  if (err) {
    console.error('❌ Error fetching users:', err);
    return;
  }
  
  console.log(`📊 Found ${users.length} users:`);
  users.forEach(user => {
    console.log(`  - ${user.username} (ID: ${user.id})`);
  });
  
  // Check passwords
  db.all('SELECT userId FROM passwords', (err, passwords) => {
    if (err) {
      console.error('❌ Error fetching passwords:', err);
      return;
    }
    
    console.log(`🔐 Found ${passwords.length} password entries:`);
    passwords.forEach(pwd => {
      console.log(`  - User ID: ${pwd.userId}`);
    });
    
    // Check which users have passwords
    const usersWithPasswords = passwords.map(p => p.userId);
    const usersWithoutPasswords = users.filter(u => !usersWithPasswords.includes(u.id));
    
    if (usersWithoutPasswords.length > 0) {
      console.log('❌ Users without passwords:');
      usersWithoutPasswords.forEach(user => {
        console.log(`  - ${user.username} (ID: ${user.id})`);
      });
    } else {
      console.log('✅ All users have passwords');
    }
    
    db.close();
  });
});
