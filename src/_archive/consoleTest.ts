/**
 * Console test to debug game data structure
 */

// Add this to your browser console to test the filtering
console.log('🧪 Testing mood filter system...');

// Test with your actual game data
const testFiltering = () => {
  // Get games from library store
  const games = window.useLibraryStore?.getState()?.games || [];
  
  console.log(`📚 Total games in library: ${games.length}`);
  
  if (games.length > 0) {
    // Show first game structure
    console.log('🎮 First game structure:', games[0]);
    console.log('🏷️ First game moods:', games[0].moods);
    console.log('🎭 First game genres:', games[0].genres);
    
    // Test filtering
    const socialGames = games.filter(game => {
      const moods = game.moods || [];
      const genres = game.genres?.map(g => g.name.toLowerCase()) || [];
      const title = game.title.toLowerCase();
      
      const hasMultiplayer = moods.some(mood => 
        mood.toLowerCase().includes('multiplayer') ||
        mood.toLowerCase().includes('coop') ||
        mood.toLowerCase().includes('online')
      ) || genres.some(genre => 
        genre.includes('multiplayer') || genre.includes('online')
      ) || title.includes('multiplayer');
      
      return hasMultiplayer;
    });
    
    console.log(`👥 Social games found: ${socialGames.length}`);
    socialGames.forEach(game => {
      console.log(`  ✅ ${game.title} - moods: ${game.moods?.join(', ') || 'None'}`);
    });
  }
};

// Auto-run test
setTimeout(testFiltering, 1000);

// Make it available globally
(window as any).testFiltering = testFiltering;
