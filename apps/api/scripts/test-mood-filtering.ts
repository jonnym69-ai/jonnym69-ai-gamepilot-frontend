import { Database } from 'sqlite3'

const db = new Database('./gamepilot.db')

// Test mood filtering logic
db.all('SELECT title, moods FROM games WHERE moods LIKE "%Intense%" LIMIT 5', (err, rows) => {
  if (err) {
    console.error('Error:', err)
    return
  }
  
  console.log('🎮 Games with "Intense" mood (should show when filtering):')
  rows.forEach(game => {
    console.log(`\n📋 ${game.title}`)
    console.log(`🎭 Moods: ${game.moods}`)
  })
  
  // Test mood filtering logic
  console.log('\n🔍 Testing mood filter logic:')
  const selectedMood = 'Intense'
  rows.forEach(game => {
    const gameMoods = JSON.parse(game.moods || '[]')
    const hasMood = gameMoods.some((mood: string) => 
      mood.toLowerCase() === selectedMood.toLowerCase()
    )
    console.log(`${game.title}: ${hasMood ? '✅ PASS' : '❌ FAIL'} - ${game.moods}`)
  })
  
  db.close()
})
