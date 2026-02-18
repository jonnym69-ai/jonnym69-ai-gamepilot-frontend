import { Database } from 'sqlite3'

const db = new Database('./gamepilot.db')

// Test mood filtering with updated CANONICAL_MOODS
db.all('SELECT title, moods FROM games WHERE moods LIKE "%Intense%" OR moods LIKE "%Relaxing%" LIMIT 10', (err, rows) => {
  if (err) {
    console.error('Error:', err)
    return
  }
  
  console.log('🎮 Testing mood filtering with updated CANONICAL_MOODS:')
  console.log('📋 Available moods: Intense, Strategic, Relaxing, Creative, High-Energy, Atmospheric, Challenging')
  
  rows.forEach(game => {
    console.log(`\n📋 ${game.title}`)
    console.log(`🎭 Moods: ${game.moods}`)
    
    // Test filtering for each mood
    const gameMoods = JSON.parse(game.moods || '[]')
    const testMoods = ['Intense', 'Relaxing', 'Strategic']
    
    testMoods.forEach(testMood => {
      const hasMood = gameMoods.some((mood: string) => 
        mood.toLowerCase() === testMood.toLowerCase()
      )
      if (hasMood) {
        console.log(`  ✅ Shows when filtering: ${testMood}`)
      }
    })
  })
  
  db.close()
})
