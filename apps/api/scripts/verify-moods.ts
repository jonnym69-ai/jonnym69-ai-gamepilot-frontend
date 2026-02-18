import { Database } from 'sqlite3'

const db = new Database('./gamepilot.db')

db.all('SELECT title, moods FROM games WHERE title LIKE "%Dark Souls%" OR title LIKE "%Counter-Strike%" OR title LIKE "%Stardew%"', (err, rows) => {
  if (err) {
    console.error('Error:', err)
    return
  }
  
  console.log('🎮 Updated Game Moods:')
  rows.forEach(game => {
    console.log(`\n📋 ${game.title}`)
    console.log(`🎭 Moods: ${game.moods}`)
  })
  
  db.close()
})
