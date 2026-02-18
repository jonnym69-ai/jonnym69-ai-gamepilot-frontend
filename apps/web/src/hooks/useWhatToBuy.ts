import { useMemo } from 'react'
import { useLibraryStore } from '../stores/useLibraryStore'
import { useWishlistStore } from '../stores/wishlistStore'
import type { RecommendedGame } from '../types/recommendations'
import { getMoodsForGenres } from '../data/moodTags'
import type { Mood } from '../types/mood'

// Static curated list of popular games for recommendations
const POPULAR_GAMES: RecommendedGame[] = [
  {
    id: 1,
    name: "Baldur's Gate 3",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg",
    steamUrl: "https://store.steampowered.com/app/1086940",
    genres: ["RPG", "Adventure", "Strategy"],
    price: "$59.99"
  },
  {
    id: 2,
    name: "Cyberpunk 2077",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
    steamUrl: "https://store.steampowered.com/app/1091500",
    genres: ["RPG", "Action", "Open World"],
    price: "$29.99"
  },
  {
    id: 3,
    name: "Stardew Valley",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg",
    steamUrl: "https://store.steampowered.com/app/413150",
    genres: ["Simulation", "RPG", "Farming"],
    price: "$14.99"
  },
  {
    id: 4,
    name: "Hades",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg",
    steamUrl: "https://store.steampowered.com/app/1145360",
    genres: ["Roguelike", "Action", "Indie"],
    price: "$24.99"
  },
  {
    id: 5,
    name: "Disco Elysium",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/646920/header.jpg",
    steamUrl: "https://store.steampowered.com/app/646920",
    genres: ["RPG", "Indie", "Turn-Based"],
    price: "$19.99"
  },
  {
    id: 6,
    name: "Vampire Survivors",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1794680/header.jpg",
    steamUrl: "https://store.steampowered.com/app/1794680",
    genres: ["Action", "Roguelike", "Survival"],
    price: "$4.99"
  },
  {
    id: 7,
    name: "Elden Ring",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg",
    steamUrl: "https://store.steampowered.com/app/1245620",
    genres: ["RPG", "Action", "Open World"],
    price: "$59.99"
  },
  {
    id: 8,
    name: "Hollow Knight",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg",
    steamUrl: "https://store.steampowered.com/app/367520",
    genres: ["Metroidvania", "Action", "Indie"],
    price: "$14.99"
  },
  {
    id: 9,
    name: "Slay the Spire",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/646570/header.jpg",
    steamUrl: "https://store.steampowered.com/app/646570",
    genres: ["Roguelike", "Strategy", "Card Game"],
    price: "$16.99"
  }
]

export const useWhatToBuy = (): RecommendedGame | null => {
  const games = useLibraryStore(state => state.games)
  const wishlist = useWishlistStore(state => state.wishlist)
  
  // Create stable random indices to prevent re-renders
  const randomGameIndex = useMemo(() => Math.floor(Math.random() * POPULAR_GAMES.length), [])
  const fallbackGameIndex = useMemo(() => Math.floor(Math.random() * POPULAR_GAMES.length), [])

  // Memoize all computation to prevent re-renders
  const computedRecommendation = useMemo(() => {
    // Get user's top moods from their library
    const userMoods: Record<Mood, number> = {} as Record<Mood, number>
    games.forEach(game => {
      if (game.genres) {
        const genreNames = game.genres.map(genre => 
          typeof genre === 'string' ? genre : genre.name
        )
        const gameMoods = getMoodsForGenres(genreNames)
        gameMoods.forEach(mood => {
          userMoods[mood] = (userMoods[mood] || 0) + 1
        })
      }
    })

    const topUserMoods = Object.entries(userMoods)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([mood]) => mood)

    // Create wishlist game set for quick lookup
    const wishlistAppIds = new Set(wishlist.map(item => item.appId))

    if (games.length === 0) {
      // No games in library, return a popular game
      return POPULAR_GAMES[randomGameIndex]
    }

    // Get user's genre preferences from their library
    const userGenres: Record<string, number> = {}
    games.forEach(game => {
      if (game.genres) {
        game.genres.forEach(genre => {
          const genreName = typeof genre === 'string' ? genre : genre.name
          userGenres[genreName] = (userGenres[genreName] || 0) + 1
        })
      }
    })

    // Sort user's genres by frequency
    const topUserGenres = Object.entries(userGenres)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre)

    // Score each popular game based on genre overlap and wishlist
    const scoredGames = POPULAR_GAMES.map(game => {
      let score = 0
      
      // Genre matching (base score)
      game.genres.forEach(genre => {
        if (topUserGenres.includes(genre)) {
          score += (3 - topUserGenres.indexOf(genre)) // Higher score for top genres
        }
      })

      // Wishlist boost (significant score increase)
      if (wishlistAppIds.has(game.id)) {
        score += 10 // Wishlist games get a big boost
      }

      // Sale detection bonus
      const wishlistItem = wishlist.find(item => item.appId === game.id)
      if (wishlistItem && wishlistItem.price && wishlistItem.price.discount_percent > 0) {
        score += Math.floor(wishlistItem.price.discount_percent / 10) // Bonus based on discount percentage
      }

      // Mood matching bonus
      const gameMoods = getMoodsForGenres(game.genres)
      const moodMatches = gameMoods.filter(mood => topUserMoods.includes(mood)).length
      score += moodMatches * 2

      return { ...game, score }
    })

    // Sort by score and return top match
    scoredGames.sort((a, b) => b.score - a.score)

    // If no good genre match, return random popular game
    if (scoredGames[0].score === 0) {
      return POPULAR_GAMES[fallbackGameIndex]
    }

    const topGame = scoredGames[0]
    
    // Get wishlist item and moods for the top game
    const wishlistItem = wishlist.find(item => item.appId === topGame.id)
    const gameMoods = getMoodsForGenres(topGame.genres)
    
    // Add recommendation reason based on why it was chosen
    const reasons = []
    if (wishlistAppIds.has(topGame.id)) {
      reasons.push("This game is on your Steam wishlist!")
    }
    if (topGame.score >= 10) {
      reasons.push("Matches your gaming preferences perfectly")
    } else if (topGame.score >= 5) {
      reasons.push("Aligns well with your favorite genres")
    }
    if (wishlistItem && wishlistItem.price && wishlistItem.price.discount_percent > 0) {
      reasons.push(`This game is on sale! Save ${wishlistItem.price.currency} ${((wishlistItem.price.initial - wishlistItem.price.final) / 100).toFixed(2)}`)
    }
    if (gameMoods.length > 0) {
      reasons.push(`Matches your ${gameMoods.length} mood preferences`)
    }
      
    return { ...topGame, recommendationReason: reasons.join(" • ") }
  }, [games, wishlist, randomGameIndex, fallbackGameIndex])

  return computedRecommendation
}
