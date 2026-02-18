import { GENRES } from '@gamepilot/static-data'

export const STEAM_GENRE_MAPPING: Record<string, string> = {
  Action: 'action',
  Adventure: 'adventure',
  RPG: 'rpg',
  Strategy: 'strategy',
  Simulation: 'simulation',
  Sports: 'sports',
  Racing: 'racing',
  Indie: 'indie',
  Casual: 'casual',
  'Massively Multiplayer': 'multiplayer'
}

export const GENRE_TO_MOOD_MAPPING: Record<string, string[]> = {
  action: ['adrenaline', 'competitive-drive', 'power-fantasy'],
  adventure: ['immersive', 'wanderlust', 'deep-dive'],
  casual: ['cozy', 'pick-up-and-play', 'calming'],
  fps: ['adrenaline', 'tactical-mindset', 'competitive-drive'],
  horror: ['atmospheric', 'survival-instinct', 'deep-dive'],
  indie: ['creative-flow', 'atmospheric', 'immersive'],
  moba: ['competitive-drive', 'strategic-depth', 'social-energy'],
  multiplayer: ['social-energy', 'competitive-drive', 'pick-up-and-play'],
  platformer: ['pick-up-and-play', 'brain-tickle', 'immersive'],
  puzzle: ['brain-tickle', 'calming', 'strategic-depth'],
  rpg: ['deep-dive', 'immersive', 'wanderlust'],
  racing: ['adrenaline', 'competitive-drive', 'pick-up-and-play'],
  roguelike: ['strategic-depth', 'survival-instinct', 'brain-tickle'],
  simulation: ['cozy', 'calming', 'creative-flow'],
  sports: ['adrenaline', 'competitive-drive', 'social-energy'],
  strategy: ['strategic-depth', 'tactical-mindset', 'calming']
}

export const mapSteamGenre = (steamGenre: string): string => {
  return STEAM_GENRE_MAPPING[steamGenre] || 'unknown'
}

export const mapGenreToMoods = (genreId: string): string[] => {
  return GENRE_TO_MOOD_MAPPING[genreId] || []
}

export const verifyGenreMapping = () => {
  const canonicalGenres = Object.keys(GENRES).filter(key => key !== 'all-genres')
  const unmappedGenres = canonicalGenres.filter(genre => 
    !GENRE_TO_MOOD_MAPPING[genre] || GENRE_TO_MOOD_MAPPING[genre].length === 0
  )
  
  if (unmappedGenres.length > 0) {
    console.warn('Unmapped genres found:', unmappedGenres)
  } else {
    console.log('All canonical genres have mood mappings')
  }
  
  return unmappedGenres.length === 0
}

export const processSteamGameData = (steamGame: any) => {
  const steamGenres = steamGame.genres?.map((g: any) => {
    // Handle both numeric indices and string descriptions
    if (typeof g === 'number') {
      // Steam API returns numeric indices - map to genre names
      const genreNames = ['Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Indie', 'Casual', 'Racing', 'FPS', 'Horror', 'Puzzle', 'Platformer', 'MOBA', 'Roguelike', 'Multiplayer']
      return genreNames[g] || 'unknown'
    } else if (typeof g === 'object' && g.description) {
      // Steam API returns objects with description
      return mapSteamGenre(g.description)
    } else if (typeof g === 'string') {
      // Direct string genre
      return mapSteamGenre(g)
    } else {
      // Fallback
      return 'unknown'
    }
  }) || []
  
  const finalGenres = steamGenres.length > 0 ? steamGenres : ['action']
  
  const moods = Array.from(
    new Set(
      finalGenres.flatMap((genreId: string) => mapGenreToMoods(genreId))
    )
  )
  
  const genres = finalGenres.map((genre: string) => ({
    id: genre,
    name: Object.values(GENRES).find(g => g.id === genre)?.name || genre,
    description: genre + ' games',
    icon: genre,
    color: '#666',
    tags: [genre],
    subgenres: []
  }))

  return {
    id: steamGame.appid?.toString() || steamGame.steam_appid,
    title: steamGame.name,
    description: steamGame.short_description || '',
    backgroundImages: steamGame.screenshots?.map((s: any) => s.path_full) || [],
    coverImage: steamGame.header_image || steamGame.img_logo_url || '',
    developer: steamGame.developers?.map((d: any) => d.name)?.join(', ') || null,
    publisher: steamGame.publishers?.map((p: any) => p.name)?.join(', ') || null,
    genres,
    subgenres: [],
    platforms: steamGame.platforms || [],
    moods,
    playHistory: [],
    releaseYear: new Date(steamGame.release_date).getFullYear(),
    appId: steamGame.appid || steamGame.steam_appid
  }
}
