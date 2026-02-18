const sqlite3 = require('sqlite3').verbose();

const dbPath = './gamepilot.db';

// COMPREHENSIVE GENRE-TO-MOOD PATTERNS
const GENRE_TO_MOOD_PATTERNS = {
  // Strategy Games
  'strategy': ['strategic', 'challenging'],
  'rts': ['strategic', 'challenging'],
  'turn-based': ['strategic', 'mindful'],
  '4x': ['strategic', 'creative'],
  'grand strategy': ['strategic', 'challenging'],
  'tower defense': ['strategic'],
  
  // Action Games
  'action': ['intense', 'action-packed'],
  'fps': ['intense', 'competitive'],
  'shooter': ['intense', 'action-packed'],
  'fighting': ['intense', 'challenging'],
  'hack and slash': ['intense', 'action-packed'],
  'beat em up': ['intense', 'action-packed'],
  
  // RPG Games
  'rpg': ['story-rich', 'challenging'],
  'action rpg': ['story-rich', 'intense'],
  'jrpg': ['story-rich', 'atmospheric'],
  'mmorpg': ['social', 'story-rich'],
  'roguelike': ['challenging', 'experimental'],
  'roguelite': ['challenging'],
  
  // Simulation Games
  'simulation': ['creative', 'relaxing'],
  'building': ['creative', 'relaxing'],
  'management': ['strategic', 'creative'],
  'tycoon': ['creative', 'strategic'],
  'farming': ['relaxing', 'creative'],
  
  // Puzzle Games
  'puzzle': ['mindful', 'challenging'],
  'hidden object': ['relaxing', 'mindful'],
  'match-3': ['relaxing', 'mindful'],
  'sokoban': ['mindful', 'challenging'],
  
  // Adventure Games
  'adventure': ['story-rich', 'atmospheric'],
  'point and click': ['story-rich', 'mindful'],
  'visual novel': ['story-rich', 'relaxing'],
  'walking simulator': ['atmospheric', 'relaxing'],
  
  // Sports & Racing
  'sports': ['competitive', 'high-energy'],
  'racing': ['high-energy', 'competitive'],
  'football': ['competitive', 'social'],
  'basketball': ['competitive', 'high-energy'],
  'soccer': ['competitive', 'social'],
  
  // Indie & Experimental
  'indie': ['experimental', 'creative'],
  'platformer': ['challenging'],
  'metroidvania': ['challenging', 'experimental'],
  'survival': ['challenging', 'gritty'],
  'crafting': ['creative', 'challenging'],
  
  // Casual & Relaxing
  'casual': ['relaxing', 'creative'],
  'family': ['social', 'relaxing'],
  'educational': ['mindful', 'creative'],
  'music': ['creative', 'relaxing'],
  'rhythm': ['creative', 'high-energy'],
  
  // Horror & Thriller
  'horror': ['gritty', 'atmospheric'],
  'survival horror': ['challenging', 'gritty'],
  'thriller': ['atmospheric', 'intense'],
  
  // Multiplayer
  'multiplayer': ['social', 'competitive'],
  'co-op': ['social', 'strategic'],
  'local co-op': ['social', 'relaxing'],
  'pvp': ['competitive', 'intense'],
  
  // Classic & Retro
  'retro': ['nostalgic', 'relaxing'],
  'arcade': ['high-energy', 'nostalgic'],
  'classic': ['nostalgic'],
  
  // Unique Categories
  'visual novel': ['story-rich', 'relaxing'],
  'dating sim': ['social', 'story-rich'],
  'idle': ['relaxing', 'creative'],
  'clicker': ['relaxing', 'mindful'],
  'text adventure': ['story-rich', 'mindful']
};

// GAME TITLE PATTERNS
const TITLE_PATTERNS = {
  // Strategy games
  'civilization': ['strategic', 'challenging'],
  'stronghold': ['strategic'],
  'age of empires': ['strategic'],
  'starcraft': ['strategic', 'competitive'],
  'warcraft': ['strategic', 'social'],
  'total war': ['strategic', 'challenging'],
  'xcom': ['strategic', 'challenging'],
  'europa universalis': ['strategic', 'challenging'],
  'crusader kings': ['strategic', 'social'],
  'stellaris': ['strategic', 'creative'],
  
  // Action games
  'call of duty': ['intense', 'competitive'],
  'battlefield': ['intense', 'competitive'],
  'doom': ['intense', 'action-packed'],
  'quake': ['intense', 'action-packed'],
  'halo': ['action-packed', 'competitive'],
  'fortnite': ['competitive', 'social'],
  'apex legends': ['competitive', 'intense'],
  'overwatch': ['competitive', 'social'],
  'valorant': ['competitive', 'intense'],
  
  // RPG games
  'skyrim': ['story-rich', 'atmospheric'],
  'witcher': ['story-rich', 'challenging'],
  'dark souls': ['challenging', 'gritty'],
  'elden ring': ['challenging', 'atmospheric'],
  'final fantasy': ['story-rich', 'atmospheric'],
  'mass effect': ['story-rich', 'competitive'],
  'dragon age': ['story-rich', 'strategic'],
  'borderlands': ['action-packed', 'social'],
  
  // Relaxing games
  'stardew valley': ['relaxing', 'creative'],
  'animal crossing': ['relaxing', 'social'],
  'minecraft': ['creative', 'relaxing'],
  'terraria': ['creative', 'challenging'],
  'no man\'s sky': ['atmospheric', 'creative'],
  'the sims': ['creative', 'relaxing'],
  'simcity': ['creative', 'strategic'],
  
  // Indie favorites
  'hollow knight': ['challenging', 'atmospheric'],
  'celeste': ['challenging'],
  'undertale': ['story-rich', 'experimental'],
  'cuphead': ['challenging', 'nostalgic'],
  'dead cells': ['challenging', 'intense'],
  'hades': ['challenging', 'story-rich'],
  'risk of rain': ['challenging', 'intense'],
  'binding of isaac': ['challenging', 'gritty'],
  
  // Popular franchises
  'grand theft auto': ['action-packed', 'competitive'],
  'red dead redemption': ['story-rich', 'atmospheric'],
  'assassin\'s creed': ['action-packed', 'story-rich'],
  'far cry': ['action-packed', 'atmospheric'],
  'watch dogs': ['action-packed', 'gritty'],
  'fallout': ['story-rich', 'gritty'],
  'bioshock': ['atmospheric', 'story-rich'],
  
  // Sports games
  'fifa': ['competitive', 'social'],
  'nba 2k': ['competitive', 'social'],
  'madden': ['competitive', 'social'],
  'mlb the show': ['competitive', 'social'],
  'nhl': ['competitive', 'social'],
  
  // Racing games
  'need for speed': ['high-energy', 'competitive'],
  'forza': ['high-energy', 'competitive'],
  'gran turismo': ['competitive', 'relaxing'],
  'mario kart': ['social', 'competitive'],
  'rocket league': ['competitive', 'high-energy']
};

function assignMoodsToGame(game) {
  let moods = [];
  
  // 1. Check title patterns first (most specific)
  const titleLower = (game.title || '').toLowerCase();
  for (const [pattern, patternMoods] of Object.entries(TITLE_PATTERNS)) {
    if (titleLower.includes(pattern)) {
      moods = [...moods, ...patternMoods];
    }
  }
  
  // 2. Check genre patterns
  const genres = Array.isArray(game.genres) ? game.genres : [];
  for (const genre of genres) {
    const genreName = typeof genre === 'string' ? genre : (genre.name || genre.id || '').toLowerCase();
    
    for (const [pattern, patternMoods] of Object.entries(GENRE_TO_MOOD_PATTERNS)) {
      if (genreName.includes(pattern)) {
        moods = [...moods, ...patternMoods];
      }
    }
  }
  
  // 3. Remove duplicates and limit to 3 moods max
  const uniqueMoods = [...new Set(moods)].slice(0, 3);
  
  // 4. Fallback to relaxing if no moods found
  return uniqueMoods.length > 0 ? uniqueMoods : ['relaxing'];
}

async function assignMoodsToAllGames() {
  console.log('🎮 Assigning proper moods to all games in database...');
  
  try {
    // Get all games
    const games = await new Promise((resolve, reject) => {
      db.all('SELECT id, title, genres FROM games', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    console.log(`🔍 Found ${games.length} games to process`);

    let updatedCount = 0;
    
    // Process each game
    for (const game of games) {
      const currentMoods = game.moods ? JSON.parse(game.moods) : [];
      const newMoods = assignMoodsToGame(game);
      
      // Only update if moods are different
      if (JSON.stringify(currentMoods) !== JSON.stringify(newMoods)) {
        // Update the game with new moods
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE games SET moods = ? WHERE id = ?',
            [JSON.stringify(newMoods), game.id],
            (err) => {
              if (err) {
                console.error(`❌ Failed to update game ${game.title}:`, err);
                reject(err);
              } else {
                console.log(`✅ Updated: ${game.title}`);
                console.log(`   Old: [${currentMoods.join(', ')}]`);
                console.log(`   New: [${newMoods.join(', ')}]`);
                updatedCount++;
                resolve();
              }
            }
          );
        });
      } else {
        console.log(`⏭️  Skipped: ${game.title} (already has proper moods)`);
      }
    }
    
    console.log(`🎉 Successfully updated ${updatedCount} games with proper moods!`);
    console.log('🔄 Refresh your GamePilot to see the changes');
    
  } catch (error) {
    console.error('❌ Error assigning moods:', error);
  }
}

// Open database connection
const db = new sqlite3.Database(dbPath);

// Run the mood assignment
assignMoodsToAllGames().then(() => {
  db.close();
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  db.close();
  process.exit(1);
});
