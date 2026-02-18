import { Database } from 'sqlite3'
import { ollamaService } from '../src/services/ollamaService'

async function reAnalyzeAllMoods() {
  const db = new Database('./gamepilot.db')
  
  console.log('🔄 Re-analyzing moods for all games with improved AI prompt...')
  
  try {
    // Get all games
    const games = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT id, title, description FROM games', (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
    
    console.log(`📊 Found ${games.length} games to re-analyze`)
    
    let updatedCount = 0
    let errorCount = 0
    
    for (const game of games) {
      try {
        console.log(`\n🎮 Processing: ${game.title}`)
        
        // Generate new moods with improved prompt
        const newMoods = await ollamaService.getMoodsFromAI(game.description || '')
        console.log(`🎭 New moods: [${newMoods.join(', ')}]`)
        
        // Update the game with new moods
        await new Promise<void>((resolve, reject) => {
          db.run(
            'UPDATE games SET moods = ? WHERE id = ?',
            [JSON.stringify(newMoods), game.id],
            function(err) {
              if (err) reject(err)
              else resolve()
            }
          )
        })
        
        updatedCount++
        
        if (updatedCount % 10 === 0) {
          console.log(`📈 Progress: ${updatedCount}/${games.length} games updated`)
        }
        
      } catch (error) {
        console.error(`❌ Failed to update ${game.title}:`, error)
        errorCount++
      }
    }
    
    console.log(`\n✅ Mood re-analysis complete!`)
    console.log(`📊 Summary:`)
    console.log(`   • Total games processed: ${games.length}`)
    console.log(`   • Successfully updated: ${updatedCount}`)
    console.log(`   • Errors: ${errorCount}`)
    console.log(`\n🎯 Games now have accurate, gameplay-specific moods!`)
    
  } catch (error) {
    console.error('❌ Failed to re-analyze moods:', error)
  } finally {
    db.close()
  }
}

reAnalyzeAllMoods().catch(console.error)
