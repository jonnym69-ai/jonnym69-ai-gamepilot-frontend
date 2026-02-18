const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = 'c:/Users/User/CascadeProjects/gamepilot/apps/api/gamepilot.db';
const db = new sqlite3.Database(dbPath);

db.get('SELECT id FROM users WHERE username = "demo"', (err, row) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  if (row) {
    console.log('Demo user ID:', JSON.stringify(row.id));
    console.log('Demo user ID length:', row.id.length);
  } else {
    console.log('Demo user not found');
  }
  
  db.close();
});
