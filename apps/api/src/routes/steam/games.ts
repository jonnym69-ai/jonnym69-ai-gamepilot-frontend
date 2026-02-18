import { Router } from 'express'
import fetch from 'node-fetch'
import { cacheService } from '../../services/cacheService'

const router = Router()
// const steamIntegration = new SteamIntegration(process.env.STEAM_API_KEY)

console.log('🎮 Steam games router initialized')

// GET /api/steam/games/featured
router.get('/featured', async (req, res) => {
  console.log('🎮 GET /steam/games/featured - Handling request')
  try {
    const { limit = 10 } = req.query
    const limitNum = Math.min(parseInt(limit as string, 10) || 10, 20) // Max 20 games

    // Check cache first
    const cacheKey = `featured_games_${limitNum}`
    const cachedData = await cacheService.get(cacheKey, 'steam')

    if (cachedData) {
      console.log(`✅ Serving featured games from cache (${cachedData.length} games)`)
      return res.json({
        success: true,
        data: cachedData,
        total: cachedData.length,
        source: 'steam_store_api_cached'
      })
    }

    console.log(`🎮 GET /steam/games/featured - Fetching ${limitNum} featured games`)

    // Get Steam API key from environment
    const steamApiKey = process.env.STEAM_API_KEY
    if (!steamApiKey) {
      console.error('❌ Steam API key not configured')
      return res.status(500).json({
        error: 'Steam API configuration error',
        message: 'Steam API key is not configured'
      })
    }

    // For featured games, we'll get popular games from Steam's most played
    // This is a simplified approach - in production you might want to curate featured games
    const featuredAppIds = [
      1172470, // Apex Legends
      730,     // Counter-Strike 2
      578080,  // PUBG
      440,     // Team Fortress 2
      570,     // Dota 2
      271590,  // Grand Theft Auto V
      236390,  // War Thunder
      359550,  // Tom Clancy's Rainbow Six Siege
      252490,  // Rust
      1085660, // Destiny 2
      1174180, // Red Dead Redemption 2
      292030,  // The Witcher 3
      346110,  // ARK: Survival Evolved
      289070,  // Sid Meier's Civilization VI
      413150   // Stardew Valley
    ].slice(0, limitNum)

    // Fetch details for each featured game
    const featuredGames = []

    for (const appId of featuredAppIds) {
      try {
        const storeUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=US&l=en`
        const storeResponse = await fetch(storeUrl)

        if (storeResponse.ok) {
          const storeData = await storeResponse.json()

          if (storeData[appId] && storeData[appId].success) {
            const gameData = storeData[appId].data

            // Format as simplified featured game
            featuredGames.push({
              id: appId.toString(),
              appId: appId,
              name: gameData.name,
              headerImage: gameData.header_image,
              capsuleImage: gameData.capsule_imagev5 || gameData.capsule_image,
              shortDescription: gameData.short_description,
              genres: gameData.genres?.map((g: any) => g.description) || [],
              releaseDate: gameData.release_date?.date || 'TBD',
              priceOverview: gameData.price_overview || null,
              platforms: gameData.platforms || {},
              isFree: gameData.is_free || false,
              recommendations: gameData.recommendations?.total || 0
            })
          }
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.warn(`⚠️ Failed to fetch details for app ${appId}:`, error)
        // Continue with other games
      }
    }

    console.log(`✅ Retrieved ${featuredGames.length} featured games`)

    // Cache the results for 1 hour (3600 seconds)
    await cacheService.set(cacheKey, featuredGames, { ttl: 3600, prefix: 'steam' })

    res.json({
      success: true,
      data: featuredGames,
      total: featuredGames.length,
      source: 'steam_store_api'
    })
  } catch (error) {
    console.error('❌ Error fetching featured games:', error)
    res.status(500).json({
      error: 'Failed to fetch featured games',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/steam/games/:appId
router.get('/games/:appId', async (req, res) => {
  try {
    const { appId } = req.params
    const appIdNum = parseInt(appId, 10)

    if (isNaN(appIdNum)) {
      return res.status(400).json({
        error: 'Invalid app ID',
        message: 'App ID must be a number'
      })
    }

    // Check cache first
    const cacheKey = `game_details_${appIdNum}`
    const cachedData = await cacheService.get(cacheKey, 'steam')

    if (cachedData) {
      console.log(`✅ Serving game details from cache for app ${appIdNum}: ${cachedData.name}`)
      return res.json(cachedData)
    }

    console.log(`🎮 GET /steam/games/${appId} - Fetching game details`)

    // Get Steam API key from environment
    const steamApiKey = process.env.STEAM_API_KEY
    if (!steamApiKey) {
      console.error('❌ Steam API key not configured')
      return res.status(500).json({
        error: 'Steam API configuration error',
        message: 'Steam API key is not configured'
      })
    }

    // Call Steam Store API for game details
    const storeUrl = `https://store.steampowered.com/api/appdetails?appids=${appIdNum}&cc=US&l=en`

    console.log(`🌐 Calling Steam Store API: ${storeUrl}`)

    const storeResponse = await fetch(storeUrl)

    if (!storeResponse.ok) {
      console.error(`❌ Steam Store API returned ${storeResponse.status}`)
      return res.status(500).json({
        error: 'Steam API error',
        message: `Failed to fetch game details: ${storeResponse.status}`
      })
    }

    const storeData = await storeResponse.json()

    if (!storeData[appIdNum] || !storeData[appIdNum].success) {
      console.log(`❌ Game ${appIdNum} not found on Steam`)
      return res.status(404).json({
        error: 'Game not found',
        message: `Game with app ID ${appIdNum} not found on Steam`
      })
    }

    const gameData = storeData[appIdNum].data
    console.log(`✅ Retrieved details for game: ${gameData.name}`)

    // Format response similar to Steam Web API format
    const formattedGame = {
      appid: appIdNum,
      name: gameData.name,
      header_image: gameData.header_image,
      capsule_image: gameData.capsule_image,
      capsule_imagev5: gameData.capsule_imagev5,
      website: gameData.website,
      release_date: gameData.release_date,
      required_age: gameData.required_age,
      is_free: gameData.is_free,
      detailed_description: gameData.detailed_description,
      about_the_game: gameData.about_the_game,
      short_description: gameData.short_description,
      supported_languages: gameData.supported_languages,
      reviews: gameData.reviews,
      price_overview: gameData.price_overview,
      packages: gameData.packages,
      package_groups: gameData.package_groups,
      platforms: gameData.platforms,
      metacritic: gameData.metacritic,
      categories: gameData.categories,
      genres: gameData.genres,
      screenshots: gameData.screenshots,
      movies: gameData.movies,
      recommendations: gameData.recommendations,
      achievements: gameData.achievements,
      release_date: gameData.release_date,
      support_info: gameData.support_info,
      background: gameData.background,
      background_raw: gameData.background_raw,
      content_descriptors: gameData.content_descriptors
    }

    // Cache the game details for 2 hours (7200 seconds) since game details don't change frequently
    await cacheService.set(cacheKey, formattedGame, { ttl: 7200, prefix: 'steam' })

    res.json(formattedGame)
  } catch (error) {
    console.error('❌ Failed to fetch game details:', error)
    res.status(500).json({
      error: 'Failed to fetch game details',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/steam/player/:steamId
router.get('/player/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params

    console.log(`🎮 GET /steam/player/${steamId} - Fetching player summary`)

    // Validate Steam ID format (basic check)
    if (!steamId || !/^\d+$/.test(steamId)) {
      return res.status(400).json({
        error: 'Invalid Steam ID',
        message: 'Steam ID must be a valid numeric ID'
      })
    }

    // Get Steam API key from environment
    const steamApiKey = process.env.STEAM_API_KEY
    if (!steamApiKey) {
      console.error('❌ Steam API key not configured')
      return res.status(500).json({
        error: 'Steam API configuration error',
        message: 'Steam API key is not configured'
      })
    }

    // Call Steam Web API for player summary
    const summaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`

    console.log(`🌐 Calling Steam User API: ${summaryUrl.replace(steamApiKey, 'REDACTED')}`)

    const summaryResponse = await fetch(summaryUrl)

    if (!summaryResponse.ok) {
      console.error(`❌ Steam User API returned ${summaryResponse.status}`)
      return res.status(500).json({
        error: 'Steam API error',
        message: `Failed to fetch player summary: ${summaryResponse.status}`
      })
    }

    const summaryData = await summaryResponse.json()

    if (!summaryData.response || !summaryData.response.players || summaryData.response.players.length === 0) {
      console.log(`❌ Player ${steamId} not found`)
      return res.status(404).json({
        error: 'Player not found',
        message: `Steam user with ID ${steamId} not found`
      })
    }

    const player = summaryData.response.players[0]
    console.log(`✅ Retrieved summary for player: ${player.personaname}`)

    res.json({
      steamid: player.steamid,
      communityvisibilitystate: player.communityvisibilitystate,
      profilestate: player.profilestate,
      personaname: player.personaname,
      commentpermission: player.commentpermission,
      profileurl: player.profileurl,
      avatar: player.avatar,
      avatarmedium: player.avatarmedium,
      avatarfull: player.avatarfull,
      avatarhash: player.avatarhash,
      lastlogoff: player.lastlogoff,
      personastate: player.personastate,
      realname: player.realname,
      primaryclanid: player.primaryclanid,
      timecreated: player.timecreated,
      personastateflags: player.personastateflags,
      loccountrycode: player.loccountrycode,
      locstatecode: player.locstatecode,
      loccityid: player.loccityid
    })
  } catch (error) {
    console.error('❌ Failed to fetch player summary:', error)
    res.status(500).json({
      error: 'Failed to fetch player summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/steam/games?steamId=xxx&apiKey=xxx
router.get('/', async (req, res) => {
  try {
    const { steamId, apiKey } = req.query

    if (!steamId || !apiKey) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'steamId and apiKey are required'
      })
    }

    console.log(`🎮 GET /steam/games - Fetching Steam games for ID: ${steamId}`)
    console.log(`🔑 Using provided API key`)

    // Use the provided API key (this could be user-specific)
    const effectiveApiKey = apiKey as string

    // Build URL manually to avoid Node.js URL issues
    const steamUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${effectiveApiKey}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true`

    console.log(`🌐 Calling Steam API: ${steamUrl.replace(effectiveApiKey, 'REDACTED')}`)

    const steamResponse = await fetch(steamUrl) as any

    if (!steamResponse.ok) {
      console.error(`❌ Steam API returned ${steamResponse.status}: ${steamResponse.statusText}`)
      return res.status(500).json({
        error: 'Steam API error',
        message: `Steam API returned ${steamResponse.status}: ${steamResponse.statusText}`
      })
    }

    const data = await steamResponse.json() as any

    if (data.error) {
      console.error(`❌ Steam API error:`, data.error)
      return res.status(500).json({
        error: 'Steam API error',
        message: data.error
      })
    }

    const games = data.response?.games || []
    console.log(`✅ Retrieved ${games.length} games from Steam API`)

    res.json({
      steamId,
      games,
      gameCount: games.length,
      source: 'real_steam_api'
    })
  } catch (error) {
    console.error('❌ Failed to fetch Steam games:', error)
    res.status(500).json({
      error: 'Failed to fetch Steam games',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/steam/games/genre/:genre
router.get('/genre/:genre', async (req, res) => {
  console.log(`🎮 GET /steam/games/genre/${req.params.genre} - Handling request`)
  try {
    const { genre } = req.params
    const { limit = 20 } = req.query
    
    console.log(`🎮 GET /steam/games/genre/${genre} - Fetching Steam games for genre: ${genre}`)
    
    // Mock data for now - this would need Steam API integration for real genre search
    // For demonstration, return some popular games by genre
    const genreGames: Record<string, any[]> = {
      'action': [
        {
          id: '1091500',
          name: 'Cyberpunk 2077',
          genres: ['Action', 'RPG'],
          coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
          headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
          description: 'An open-world, action-adventure story set in Night City',
          price: '$29.99',
          releaseDate: '2020-12-10'
        },
        {
          id: '892970',
          name: 'Valheim',
          genres: ['Action', 'Adventure', 'Survival'],
          coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/892970/header.jpg',
          headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/892970/header.jpg',
          description: 'A brutal exploration and survival game for 1-10 players',
          price: '$19.99',
          releaseDate: '2021-02-02'
        }
      ],
      'indie': [
        {
          id: '252490',
          name: 'Rust',
          genres: ['Action', 'Adventure', 'Indie', 'Massively Multiplayer'],
          coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/252490/header.jpg',
          headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/252490/header.jpg',
          description: 'The only aim in Rust is to survive.',
          price: '$39.99',
          releaseDate: '2013-02-21'
        },
        {
          id: '105600',
          name: 'Terraria',
          genres: ['Action', 'Adventure', 'Indie', 'RPG'],
          coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/105600/header.jpg',
          headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/105600/header.jpg',
          description: 'Dig, fight, explore, build! The ultimate sandbox adventure.',
          price: '$9.99',
          releaseDate: '2011-05-16'
        }
      ],
      'rpg': [
        {
          id: '1086940',
          name: 'Baldur\'s Gate 3',
          genres: ['RPG', 'Strategy', 'Adventure'],
          coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg',
          headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg',
          description: 'Gather your party and venture forth!',
          price: '$59.99',
          releaseDate: '2020-10-06'
        },
        {
          id: '292030',
          name: 'The Witcher 3: Wild Hunt',
          genres: ['RPG', 'Adventure'],
          coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg',
          headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg',
          description: 'You are Geralt of Rivia, mercenary monster slayer.',
          price: '$39.99',
          releaseDate: '2015-05-19'
        }
      ],
      'sports': [
        {
          id: '730',
          name: 'Counter-Strike 2',
          genres: ['Action', 'FPS', 'Multiplayer'],
          coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg',
          headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg',
          description: 'Counter-Strike 2 is a free-to-play multiplayer game.',
          price: 'Free to Play',
          releaseDate: '2023-09-27'
        },
        {
          id: '210970',
          name: 'Rocket League',
          genres: ['Sports', 'Racing', 'Indie'],
          coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/210970/header.jpg',
          headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/210970/header.jpg',
          description: 'Rocket League is a high-powered hybrid of arcade-style soccer.',
          price: 'Free to Play',
          releaseDate: '2015-07-07'
        }
      ]
    }
    
    const games = genreGames[genre.toLowerCase()] || []
    const limitedGames = games.slice(0, parseInt(limit as string, 10))
    
    console.log(`✅ Retrieved ${limitedGames.length} games for genre: ${genre}`)
    
    res.json({
      success: true,
      data: limitedGames,
      genre,
      totalFound: games.length,
      limit: parseInt(limit as string, 10)
    })
  } catch (error) {
    console.error('Error fetching games by genre:', error)
    res.status(500).json({ 
      error: 'Failed to fetch games by genre',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/steam/library/:steamId
router.get('/library/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params
    
    // Note: SteamIntegration has getOwnedGames method, not getPlayerLibrary
    // const library = await steamIntegration.getOwnedGames(steamId)
    res.json({
      steamId,
      gameCount: 0,
      games: []
    })
  } catch (error) {
    console.error('Error fetching player library:', error)
    res.status(500).json({ 
      error: 'Failed to fetch player library',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
