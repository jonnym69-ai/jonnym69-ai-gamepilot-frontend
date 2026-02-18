import { Database } from 'sqlite3'
import { promisify } from 'util'

async function getTableStructure() {
  const db = new Database('./gamepilot.db')
  
  try {
    const rows = await new Promise<any[]>((resolve, reject) => {
      db.all('PRAGMA table_info(games);', (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
    
    console.log('📋 Games table structure:')
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} (${row.type}) - ${row.notnull ? 'NOT NULL' : 'NULL'}${row.pk ? ' PRIMARY KEY' : ''}`)
    })
  } catch (error) {
    console.error('❌ Error getting table structure:', error)
  } finally {
    db.close()
  }
}

getTableStructure().catch(console.error)
