import { useLibraryStore } from '../stores/useLibraryStore'

export function debugGameData() {
  const { games } = useLibraryStore.getState()
  
  console.log('🎮 Game Data Debug Analysis')
  console.log('=' .repeat(50))
  
  if (!games || games.length === 0) {
    console.log('❌ No games found in library')
    return
  }
  
  console.log(`📊 Total Games: ${games.length}`)
  
  // Sample first few games to see data structure
  console.log('\n🔍 Sample Game Data Structure:')
  games.slice(0, 3).forEach((game, index) => {
    console.log(`\nGame ${index + 1}: ${game.title}`)
    console.log(`  ID: ${game.id}`)
    console.log(`  Genres:`, game.genres)
    console.log(`  Genres type:`, typeof game.genres)
    console.log(`  Play Status: ${game.playStatus}`)
    console.log(`  Hours Played: ${game.hoursPlayed}`)
    console.log(`  Tags:`, game.tags)
    console.log(`  Platforms:`, game.platforms?.map(p => p.name))
  })
  
  // Genre analysis
  console.log('\n📈 Genre Analysis:')
  const genreTypes: Record<string, number> = {}
  games.forEach(game => {
    const genreType = typeof game.genres
    genreTypes[genreType] = (genreTypes[genreType] || 0) + 1
    
    if (Array.isArray(game.genres)) {
      game.genres.forEach((genre, i) => {
        if (i < 3) { // Only show first 3 to avoid spam
          console.log(`  "${game.title}" genre ${i}:`, typeof genre, genre)
        }
      })
    }
  })
  
  console.log('\n📊 Genre Data Types:', genreTypes)
  
  // Status distribution
  console.log('\n📊 Play Status Distribution:')
  const statusCounts: Record<string, number> = {}
  games.forEach(game => {
    statusCounts[game.playStatus] = (statusCounts[game.playStatus] || 0) + 1
  })
  console.log(statusCounts)
  
  // Playtime analysis
  const totalPlaytime = games.reduce((sum, game) => sum + (game.hoursPlayed || 0), 0)
  const avgPlaytime = totalPlaytime / games.length
  console.log(`\n⏱️  Playtime Analysis:`)
  console.log(`  Total: ${totalPlaytime} hours`)
  console.log(`  Average: ${avgPlaytime.toFixed(1)} hours per game`)
  
  // Check for completed games
  const completedGames = games.filter(g => g.playStatus === 'completed').length
  console.log(`  Completion Rate: ${((completedGames / games.length) * 100).toFixed(1)}%`)
  
  console.log('\n' + '=' .repeat(50))
  console.log('🏁 Debug Complete!')
}

// Add to window for console access
declare global {
  interface Window {
    debugGameData: () => void
  }
}

// Initialize
if (typeof window !== 'undefined') {
  window.debugGameData = debugGameData
  console.log('🔍 Game data debug command available: debugGameData()')
}
