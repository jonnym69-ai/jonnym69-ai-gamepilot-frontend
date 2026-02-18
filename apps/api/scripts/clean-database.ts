import { Database } from 'sqlite3'

async function cleanDatabase() {
  const db = new Database('./gamepilot.db')
  
  console.log('🧹 Cleaning database - removing duplicates and test entries...')
  
  try {
    // Remove duplicate CS:GO entries (keep the one with AI moods)
    console.log('🗑️ Removing duplicate CS:GO entries...')
    await new Promise<void>((resolve, reject) => {
      db.run(
        `DELETE FROM games 
         WHERE title LIKE '%Counter-Strike%' 
         AND moods = '[]'`,
        function(err) {
          if (err) reject(err)
          else resolve()
        }
      )
    })
    
    // Remove test entries
    console.log('🗑️ Removing test entries...')
    await new Promise<void>((resolve, reject) => {
      db.run(
        "DELETE FROM games WHERE title IN ('Test Game', 'User1 Game 1', 'User1 Game 2')",
        function(err) {
          if (err) reject(err)
          else resolve()
        }
      )
    })
    
    // Check remaining games
    const remainingGames = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT title, moods FROM games WHERE title LIKE "%Counter-Strike%"', (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
    
    console.log('\n✅ Database cleanup complete!')
    console.log('📊 Remaining CS:GO entries:')
    remainingGames.forEach(game => {
      console.log(`   • ${game.title}: ${game.moods}`)
    })
    
    console.log('\n🎯 Library is now clean and ready for accurate mood filtering!')
    
  } catch (error) {
    console.error('❌ Failed to clean database:', error)
  } finally {
    db.close()
  }
}

cleanDatabase().catch(console.error)
