import { Router } from 'express'

const router = Router()

console.log('🎮 Steam routes loaded successfully!')

// Add a simple test route
router.get('/test', (req, res) => {
  console.log('🎮 Steam test route hit')
  res.json({ message: 'Steam routes are working!', timestamp: new Date().toISOString() })
})

// Add the genre endpoint directly here for now
router.get('/genre/:genre', (req, res) => {
  console.log(`🎮 GET /steam/games/genre/${req.params.genre} - Handling request`)
  try {
    const { genre } = req.params
    const { limit = 20 } = req.query
    
    console.log(`🎮 GET /steam/games/genre/${genre} - Fetching Steam games for genre: ${genre}`)
    
    // Mock data for now
    const genreGames: Record<string, any[]> = {
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

export default router
