const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = 'c:/Users/User/CascadeProjects/gamepilot/apps/api/gamepilot.db';
const db = new sqlite3.Database(dbPath);

console.log('🗄️ GamePilot Database Contents');
console.log('================================');

// Get all table names
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error:', err);
    return;
  }

  tables.forEach(table => {
    const tableName = table.name;
    console.log(`\n📋 Table: ${tableName}`);
    console.log('─'.repeat(50));

    // Get table schema
    db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
      if (err) return;
      
      console.log('Columns:');
      columns.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
      });

      // Get row count
      db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, result) => {
        if (err) return;
        console.log(`Rows: ${result.count}`);

        // Show first few rows if table has data
        if (result.count > 0) {
          db.all(`SELECT * FROM ${tableName} LIMIT 3`, (err, rows) => {
            if (err) return;
            
            if (rows.length > 0) {
              console.log('Sample data:');
              rows.forEach((row, index) => {
                console.log(`  Row ${index + 1}:`, JSON.stringify(row, null, 2));
              });
            }
          });
        }
      });
    });
  });

  setTimeout(() => {
    db.close();
  }, 2000);
});
