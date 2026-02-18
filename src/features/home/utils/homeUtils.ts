// Enhanced home utility functions for gaming identity and personalization

export const getMoodOfTheDay = () => {
  const hour = new Date().getHours()
  const dayOfWeek = new Date().getDay()
  
  // Weekend vs weekday moods
  if (dayOfWeek >= 6 || dayOfWeek <= 0) {
    // Weekend - more relaxed, social gaming
    if (hour >= 10 && hour < 14) return 'social'
    if (hour >= 14 && hour < 18) return 'competitive'
    if (hour >= 18 && hour < 22) return 'party'
    if (hour >= 22 || hour < 6) return 'chill'
  } else {
    // Weekday - more focused gaming
    if (hour >= 6 && hour < 9) return 'focused'
    if (hour >= 9 && hour < 12) return 'strategic'
    if (hour >= 12 && hour < 17) return 'creative'
    if (hour >= 17 && hour < 20) return 'adventurous'
    if (hour >= 20 || hour < 6) return 'relaxed'
  }
}

export const getRecommendedGenres = () => {
  const currentHour = new Date().getHours()
  const dayOfWeek = new Date().getDay()
  
  // Time-based genre recommendations
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    // Weekdays - work/school focus
    if (currentHour >= 6 && currentHour < 9) return ['Puzzle', 'Strategy']
    if (currentHour >= 9 && currentHour < 12) return ['RPG', 'Adventure']
    if (currentHour >= 12 && currentHour < 14) return ['Action', 'Shooter']
    if (currentHour >= 14 && currentHour < 17) return ['Simulation', 'Racing']
    if (currentHour >= 17 && currentHour < 20) return ['Sports', 'Fighting']
    if (currentHour >= 20 || currentHour < 6) return ['Puzzle', 'Strategy']
  } else {
    // Weekend - casual/social focus
    if (currentHour >= 10 && currentHour < 14) return ['Party', 'Music']
    if (currentHour >= 14 && currentHour < 18) return ['Racing', 'Sports']
    if (currentHour >= 18 && currentHour < 22) return ['Action', 'Adventure']
    if (currentHour >= 22 || currentHour < 10) return ['Puzzle', 'Simulation']
  }
  
  // Default fallback
  return ['Action', 'Adventure']
}

export const getGamerProfile = () => {
  // Generate a gamer profile based on time and preferences
  const mood = getMoodOfTheDay()
  
  const profiles = {
    focused: { title: 'Elite Gamer', level: 'Professional', emoji: '🏆' },
    strategic: { title: 'Tactical Gamer', level: 'Mastermind', emoji: '🧠' },
    creative: { title: 'Creative Gamer', level: 'Artist', emoji: '🎨' },
    adventurous: { title: 'Explorer', level: 'Adventurer', emoji: '🗺️' },
    social: { title: 'Social Gamer', level: 'Team Player', emoji: '👥' },
    competitive: { title: 'Competitor', level: 'Champion', emoji: '🏆' },
    party: { title: 'Party Gamer', level: 'Fun Master', emoji: '🎉' },
    chill: { title: 'Casual Gamer', level: 'Relaxed', emoji: '😌' },
    relaxed: { title: 'Chill Gamer', level: 'Zen Master', emoji: '🧘' }
  }
  
  return profiles[mood as keyof typeof profiles] || profiles.focused
}

export const getGamerStats = () => {
  // Generate gamer stats and achievements
  return {
    totalSessions: Math.floor(Math.random() * 1000) + 100,
    favoriteGenre: ['Action', 'RPG', 'Strategy', 'Puzzle'][Math.floor(Math.random() * 4)],
    playStyle: ['Competitive', 'Casual', 'Story-driven', 'Exploration'][Math.floor(Math.random() * 4)],
    longestSession: Math.floor(Math.random() * 8) + 2,
    achievements: Math.floor(Math.random() * 500) + 50,
    completionRate: Math.floor(Math.random() * 30) + 60
  }
}

export const getGamingGoals = () => {
  const goals = [
    { id: 'backlog-clear', title: 'Clear Backlog', description: 'Finish all games in backlog', progress: 65 },
    { id: '100-completion', title: '100% Completion', description: 'Complete every game you start', progress: 82 },
    { id: 'genre-explorer', title: 'Genre Explorer', description: 'Try 5 different game genres', progress: 40 },
    { id: 'speedrun', title: 'Speed Run', description: 'Complete a game under 2 hours', progress: 25 },
    { id: 'social-gamer', title: 'Social Gaming', description: 'Play with friends weekly', progress: 90 }
  ]
  
  return goals.slice(0, 3) // Show 3 random goals
}

export const getSpotlightGames = () => {
  return [
    {
      id: 'spotlight-1',
      title: 'Recently Played',
      description: 'Jump back into your recent gaming sessions',
      games: [
        { 
          id: 'game-1', 
          title: 'Cyberpunk 2077', 
          playStatus: 'playing', 
          lastPlayed: new Date(Date.now() - 86400000).toISOString(),
          developer: 'CD Projekt Red',
          genres: ['RPG', 'Action'],
          playtime: 45
        },
        { 
          id: 'game-2', 
          title: 'Elden Ring', 
          playStatus: 'completed', 
          lastPlayed: new Date(Date.now() - 172800000).toISOString(),
          developer: 'FromSoftware',
          genres: ['Action', 'RPG'],
          playtime: 120
        },
        { 
          id: 'game-3', 
          title: 'Zelda: Tears of the Kingdom', 
          playStatus: 'paused', 
          lastPlayed: new Date(Date.now() - 259200000).toISOString(),
          developer: 'Nintendo',
          genres: ['Adventure'],
          playtime: 60
        }
      ]
    },
    {
      id: 'spotlight-2',
      title: 'Highly Rated',
      description: 'Your top-rated games based on your preferences',
      games: [
        { 
          id: 'game-4', 
          title: 'The Witcher 3', 
          rating: 9.5, 
          playStatus: 'completed',
          developer: 'CD Projekt Red',
          genres: ['RPG']
        },
        { 
          id: 'game-5', 
          title: 'Red Dead Redemption 2', 
          rating: 9.2, 
          playStatus: 'completed',
          developer: 'Rockstar Games',
          genres: ['Action', 'Adventure']
        },
        { 
          id: 'game-6', 
          title: 'God of War', 
          rating: 8.8, 
          playStatus: 'playing',
          developer: 'Santa Monica Studio',
          genres: ['Action']
        }
      ]
    },
    {
      id: 'spotlight-3',
      title: 'Trending Now',
      description: 'Popular games in the community right now',
      games: [
        { 
          id: 'game-7', 
          title: 'Baldur\'s Gate 3', 
          trending: true,
          developer: 'Larian Studios',
          genres: ['RPG']
        },
        { 
          id: 'game-8', 
          title: 'Hogwarts Legacy', 
          trending: true,
          developer: 'Avalanche Software',
          genres: ['RPG']
        },
        { 
          id: 'game-9', 
          title: 'Street Fighter 6', 
          trending: true,
          developer: 'Capcom',
          genres: ['Fighting']
        }
      ]
    },
    {
      id: 'spotlight-4',
      title: 'Perfect for Weekend',
      description: 'Great games to play when you have more time',
      games: [
        { 
          id: 'game-10', 
          title: 'Stardew Valley', 
          genre: 'Simulation',
          developer: 'ConcernedApe'
        },
        { 
          id: 'game-11', 
          title: 'Animal Crossing', 
          genre: 'Simulation',
          developer: 'Nintendo'
        },
        { 
          id: 'game-12', 
          title: 'Mario Kart', 
          genre: 'Racing',
          developer: 'Nintendo'
        }
      ]
    }
  ]
}
