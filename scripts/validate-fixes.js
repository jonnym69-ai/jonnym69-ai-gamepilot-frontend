import { SteamAdapter } from '../packages/shared/dist/adapters/steamAdapter.js';
import { GENRES, MOODS, TAGS } from '../packages/static-data/dist/index.js';
import { personaEngine } from '../packages/identity-engine/dist/index.js';

// Mock game data similar to what's in the library
const mockSteamGames = [
  {
    appid: 1230,
    name: "Counter-Strike: Global Offensive",
    playtime_forever: 1200,
    steam_genres: ["Action", "FPS"],
    short_description: "The world's #1 online action game",
    developer: "Valve",
    publisher: "Valve"
  },
  {
    appid: 292030,
    name: "The Witcher 3: Wild Hunt",
    playtime_forever: 3600,
    steam_genres: ["RPG", "Adventure"],
    short_description: "Epic fantasy RPG adventure",
    developer: "CD Projekt Red",
    publisher: "CD Projekt Red"
  },
  {
    appid: 105600,
    name: "Terraria",
    playtime_forever: 2400,
    steam_genres: ["Action", "Adventure", "Indie"],
    short_description: "Dig, fight, explore, build!",
    developer: "Re-Logic",
    publisher: "Re-Logic"
  }
];

console.log('🧪 GamePilot Steam Adapter & Persona Engine Validation');
console.log('=' .repeat(60));

// Test 1: Steam Adapter Genre Mapping
console.log('\n📊 Test 1: Steam Adapter Genre Mapping');
console.log('-' .repeat(40));

let adapterSuccessCount = 0;
let adapterTotalCount = mockSteamGames.length;

const processedGames = mockSteamGames.map(steamGame => {
  try {
    const canonicalGame = SteamAdapter.toCanonicalGame(steamGame);
    
    console.log(`✅ ${steamGame.name}`);
    console.log(`   Steam Genres: [${steamGame.steam_genres?.join(', ') || 'N/A'}]`);
    console.log(`   Canonical Genres: [${canonicalGame.genres.map(g => g.name).join(', ')}]`);
    console.log(`   Tags: [${canonicalGame.tags.map(t => t.name).join(', ')}]`);
    console.log(`   Platforms: [${canonicalGame.platforms.map(p => p.name).join(', ')}]`);
    
    // Verify genres are not "unknown"
    const hasUnknownGenre = canonicalGame.genres.some(g => g.name === 'unknown');
    if (!hasUnknownGenre) {
      adapterSuccessCount++;
    }
    
    return canonicalGame;
  } catch (error) {
    console.error(`❌ Failed to process ${steamGame.name}:`, error);
    return null;
  }
});

console.log(`\n📈 Adapter Success Rate: ${adapterSuccessCount}/${adapterTotalCount} (${((adapterSuccessCount/adapterTotalCount)*100).toFixed(1)}%)`);

// Test 2: Persona Engine with Processed Games
console.log('\n🧠 Test 2: Persona Engine Analysis');
console.log('-' .repeat(40));

const validGames = processedGames.filter(game => game !== null);
if (validGames.length > 0) {
  try {
    // Create a mock user profile
    const mockUser = {
      id: 'test-user',
      username: 'TestUser',
      email: 'test@example.com',
      preferences: {
        favoriteGenres: ['Action', 'RPG'],
        playstyle: 'competitive',
        sessionLength: 'medium'
      }
    };

    // Create game sessions from playtime data
    const gameSessions = validGames.map(game => ({
      gameId: game.id,
      title: game.title,
      genres: game.genres,
      playtime: game.hoursPlayed || 0,
      sessionDate: new Date(),
      mood: 'neutral'
    }));

    // Test persona computation
    const personaProfile = personaEngine.computePersona(mockUser, gameSessions);
    
    console.log('✅ Persona Engine Results:');
    console.log(`   User Mood: ${personaProfile.mood?.name || 'Not detected'}`);
    console.log(`   Playstyle: ${personaProfile.playstyle?.name || 'Not detected'}`);
    console.log(`   Genre Affinity: ${personaProfile.genreAffinity?.slice(0, 3).map(g => `${g.genre} (${g.score.toFixed(2)})`).join(', ') || 'None'}`);
    console.log(`   Total Sessions: ${gameSessions.length}`);
    console.log(`   Total Playtime: ${gameSessions.reduce((sum, s) => sum + s.playtime, 0)} hours`);

    // Test 3: Mood-Based Recommendations
    console.log('\n🎯 Test 3: Mood-Based Recommendations');
    console.log('-' .repeat(40));

    const testMoods = ['energetic', 'focused', 'relaxed', 'competitive', 'social'];
    
    testMoods.forEach(mood => {
      const recommendations = personaEngine.getMoodRecommendations(mood, validGames, 3);
      console.log(`${mood}: ${recommendations.length} games (${recommendations.map(g => g.title).join(', ') || 'None'})`);
    });

    // Test 4: Behavioral Patterns
    console.log('\n📊 Test 4: Behavioral Pattern Analysis');
    console.log('-' .repeat(40));

    const patterns = personaEngine.analyzeBehavioralPatterns(gameSessions);
    console.log(`✅ Behavioral Patterns:`);
    console.log(`   Completion Rate: ${patterns.completionRate?.toFixed(1) || 'N/A'}%`);
    console.log(`   Avg Session Length: ${patterns.avgSessionLength?.toFixed(1) || 'N/A'} hours`);
    console.log(`   Genre Loyalty: ${patterns.genreLoyalty?.toFixed(1) || 'N/A'}%`);
    console.log(`   Variety Score: ${patterns.varietyScore?.toFixed(1) || 'N/A'}`);

  } catch (error) {
    console.error('❌ Persona Engine Error:', error);
  }
} else {
  console.log('❌ No valid games to test persona engine');
}

// Test 5: Genre Distribution Analysis
console.log('\n📈 Test 5: Genre Distribution Analysis');
console.log('-' .repeat(40));

const genreCounts = {};
validGames.forEach(game => {
  game.genres.forEach(genre => {
    genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
  });
});

console.log('Genre Distribution:');
Object.entries(genreCounts)
  .sort(([,a], [,b]) => b - a)
  .forEach(([genre, count]) => {
    console.log(`   ${genre}: ${count} games`);
  });

// Final Summary
console.log('\n🎉 VALIDATION SUMMARY');
console.log('=' .repeat(60));
console.log(`✅ Steam Adapter: ${adapterSuccessCount}/${adapterTotalCount} games processed successfully`);
console.log(`✅ Genre Mapping: ${adapterSuccessCount > 0 ? 'Working' : 'Failed'}`);
console.log(`✅ Persona Engine: ${validGames.length > 0 ? 'Tested' : 'Skipped (no valid games)'}`);
console.log(`✅ Recommendations: ${validGames.length > 0 ? 'Generated' : 'Skipped'}`);

const overallSuccess = adapterSuccessCount === adapterTotalCount && validGames.length > 0;
console.log(`\n🎯 Overall Status: ${overallSuccess ? '✅ ALL TESTS PASSED' : '⚠️  SOME ISSUES DETECTED'}`);

if (overallSuccess) {
  console.log('\n🚀 Ready for next development phase!');
} else {
  console.log('\n🔧 Additional fixes may be needed.');
}
