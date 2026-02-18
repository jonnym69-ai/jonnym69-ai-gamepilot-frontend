// Unit tests for User model
const sharedModels = require('../../../../packages/shared/src/index') as any
const { 
  User, 
  PlaystyleArchetype, 
  MoodProfile, 
  UserMoodEntry,
  CustomField,
  PlaystyleArchetypeType,
  MoodType,
  createDefaultUser,
  isValidUser,
  isValidGamingProfile,
  isValidPrivacySettings,
  isValidPreferences,
  isValidSocialSettings,
  isValidPlaystyleArchetype,
  isValidMoodProfile,
  isValidUserMoodEntry
} = sharedModels

describe('User Model', () => {
  describe('isValidUser', () => {
    it('should return true for valid user', () => {
      const validUser: any = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
        gamingProfile: {
          primaryPlatforms: ['steam'],
          genreAffinities: { action: 80, rpg: 90 },
          playstyleArchetypes: [],
          moodProfile: {
            moodHistory: [],
            moodTriggers: [],
            moodPreferences: {}
          },
          totalPlaytime: 1000,
          gamesPlayed: 50,
          gamesCompleted: 25,
          achievementsCount: 10,
          averageRating: 4.5,
          currentStreak: 5,
          longestStreak: 10,
          favoriteGames: ['game-1', 'game-2']
        },
        integrations: [],
        privacy: {
          profileVisibility: 'public',
          sharePlaytime: true,
          shareAchievements: true,
          shareGameLibrary: false,
          allowFriendRequests: true,
          showOnlineStatus: true
        },
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            achievements: true,
            recommendations: true,
            friendActivity: true,
            platformUpdates: false
          },
          display: {
            compactMode: false,
            showGameCovers: true,
            animateTransitions: true,
            showRatings: true
          }
        },
        social: {
          friends: [],
          blockedUsers: [],
          favoriteGenres: ['action', 'rpg'],
          customTags: []
        }
      }

      expect(isValidUser(validUser)).toBe(true)
    })

    it('should return false for invalid user missing required fields', () => {
      const invalidUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
        gamingProfile: {
          primaryPlatforms: ['steam'],
          genreAffinities: { action: 80, rpg: 90 },
          playstyleArchetypes: [],
          moodProfile: {
            moodHistory: [],
            moodTriggers: [],
            moodPreferences: {}
          },
          totalPlaytime: 1000,
          gamesPlayed: 50,
          gamesCompleted: 25,
          achievementsCount: 10,
          averageRating: 4.5,
          currentStreak: 5,
          longestStreak: 10,
          favoriteGames: ['game-1', 'game-2']
        },
        integrations: [],
        privacy: {
          profileVisibility: 'public',
          sharePlaytime: true,
          shareAchievements: true,
          shareGameLibrary: false,
          allowFriendRequests: true,
          showOnlineStatus: true
        },
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            achievements: true,
            recommendations: true,
            friendActivity: true,
            platformUpdates: false
          },
          display: {
            compactMode: false,
            showGameCovers: true,
            animateTransitions: true,
            showRatings: true
          }
        },
        social: {
          friends: [],
          blockedUsers: [],
          favoriteGenres: ['action', 'rpg'],
          customTags: []
        }
      }

      // Remove required field
      const invalidUserMissingEmail = { ...invalidUser, email: '' }
      expect(isValidUser(invalidUserMissingEmail)).toBe(false)

      // Remove required field
      const invalidUserMissingUsername = { ...invalidUser, username: '' }
      expect(isValidUser(invalidUserMissingUsername)).toBe(false)

      // Remove required field
      const invalidUserMissingDisplayName = { ...invalidUser, displayName: '' }
      expect(isValidUser(invalidUserMissingDisplayName)).toBe(false)

      // Remove required field
      const invalidUserMissingTimezone = { ...invalidUser, timezone: '' }
      expect(isValidUser(invalidUserMissingTimezone)).toBe(false)

      // Invalid date types
      const invalidUserBadDates = { ...invalidUser, createdAt: 'invalid-date' as any }
      expect(isValidUser(invalidUserBadDates)).toBe(false)
    })

    it('should return false for user with invalid gaming profile', () => {
      const invalidUser: any = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
        gamingProfile: {
          primaryPlatforms: 'invalid' as any,
          genreAffinities: { action: 80, rpg: 90 },
          playstyleArchetypes: [],
          moodProfile: {
            moodHistory: [],
            moodTriggers: [],
            moodPreferences: {}
          },
          totalPlaytime: 1000,
          gamesPlayed: 50,
          gamesCompleted: 25,
          achievementsCount: 10,
          averageRating: 4.5,
          currentStreak: 5,
          longestStreak: 10,
          favoriteGames: ['game-1', 'game-2']
        },
        integrations: [],
        privacy: {
          profileVisibility: 'public',
          sharePlaytime: true,
          shareAchievements: true,
          shareGameLibrary: false,
          allowFriendRequests: true,
          showOnlineStatus: true
        },
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            achievements: true,
            recommendations: true,
            friendActivity: true,
            platformUpdates: false
          },
          display: {
            compactMode: false,
            showGameCovers: true,
            animateTransitions: true,
            showRatings: true
          }
        },
        social: {
          friends: [],
          blockedUsers: [],
          favoriteGenres: ['action', 'rpg'],
          customTags: []
        }
      }

      expect(isValidUser(invalidUser)).toBe(false)
    })

    it('should return false for user with invalid privacy settings', () => {
      const invalidUser: any = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
        gamingProfile: {
          primaryPlatforms: ['steam'],
          genreAffinities: { action: 80, rpg: 90 },
          playstyleArchetypes: [],
          moodProfile: {
            moodHistory: [],
            moodTriggers: [],
            moodPreferences: {}
          },
          totalPlaytime: 1000,
          gamesPlayed: 50,
          gamesCompleted: 25,
          achievementsCount: 10,
          averageRating: 4.5,
          currentStreak: 5,
          longestStreak: 10,
          favoriteGames: ['game-1', 'game-2']
        },
        integrations: [],
        privacy: {
          profileVisibility: 'invalid' as any,
          sharePlaytime: true,
          shareAchievements: true,
          shareGameLibrary: false,
          allowFriendRequests: true,
          showOnlineStatus: true
        },
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            achievements: true,
            recommendations: true,
            friendActivity: true,
            platformUpdates: false
          },
          display: {
            compactMode: false,
            showGameCovers: true,
            animateTransitions: true,
            showRatings: true
          }
        },
        social: {
          friends: [],
          blockedUsers: [],
          favoriteGenres: ['action', 'rpg'],
          customTags: []
        }
      }

      expect(isValidUser(invalidUser)).toBe(false)
    })

    it('should return false for user with invalid preferences', () => {
      const invalidUser: any = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
        gamingProfile: {
          primaryPlatforms: ['steam'],
          genreAffinities: { action: 80, rpg: 90 },
          playstyleArchetypes: [],
          moodProfile: {
            moodHistory: [],
            moodTriggers: [],
            moodPreferences: {}
          },
          totalPlaytime: 1000,
          gamesPlayed: 50,
          gamesCompleted: 25,
          achievementsCount: 10,
          averageRating: 4.5,
          currentStreak: 5,
          longestStreak: 10,
          favoriteGames: ['game-1', 'game-2']
        },
        integrations: [],
        privacy: {
          profileVisibility: 'public',
          sharePlaytime: true,
          shareAchievements: true,
          shareGameLibrary: false,
          allowFriendRequests: true,
          showOnlineStatus: true
        },
        preferences: {
          theme: 'invalid' as any,
          language: 'en',
          notifications: {
            email: true,
            push: true,
            achievements: true,
            recommendations: true,
            friendActivity: true,
            platformUpdates: false
          },
          display: {
            compactMode: false,
            showGameCovers: true,
            animateTransitions: true,
            showRatings: true
          }
        },
        social: {
          friends: [],
          blockedUsers: [],
          favoriteGenres: ['action', 'rpg'],
          customTags: []
        }
      }

      expect(isValidUser(invalidUser)).toBe(false)
    })

    it('should return false for user with invalid social settings', () => {
      const invalidUser: any = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
        gamingProfile: {
          primaryPlatforms: ['steam'],
          genreAffinities: { action: 80, rpg: 90 },
          playstyleArchetypes: [],
          moodProfile: {
            moodHistory: [],
            moodTriggers: [],
            moodPreferences: {}
          },
          totalPlaytime: 1000,
          gamesPlayed: 50,
          gamesCompleted: 25,
          achievementsCount: 10,
          averageRating: 4.5,
          currentStreak: 5,
          longestStreak: 10,
          favoriteGames: ['game-1', 'game-2']
        },
        integrations: [],
        privacy: {
          profileVisibility: 'public',
          sharePlaytime: true,
          shareAchievements: true,
          shareGameLibrary: false,
          allowFriendRequests: true,
          showOnlineStatus: true
        },
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            achievements: true,
            recommendations: true,
            friendActivity: true,
            platformUpdates: false
          },
          display: {
            compactMode: false,
            showGameCovers: true,
            animateTransitions: true,
            showRatings: true
          }
        },
        social: {
          friends: 'invalid' as any,
          blockedUsers: [],
          favoriteGenres: ['action', 'rpg'],
          customTags: []
        }
      }

      expect(isValidUser(invalidUser)).toBe(false)
    })
  })

  describe('createDefaultUser', () => {
    it('should create a user with default values', () => {
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        timezone: 'UTC'
      }

      const user = createDefaultUser(userData)

      expect(user.id).toBe(userData.id)
      expect(user.email).toBe(userData.email)
      expect(user.username).toBe(userData.username)
      expect(user.displayName).toBe(userData.displayName || userData.username)
      expect(user.timezone).toBe(userData.timezone || 'UTC')
      expect(user.gamingProfile.primaryPlatforms).toEqual([])
      expect(user.gamingProfile.genreAffinities).toEqual({})
      expect(user.gamingProfile.playstyleArchetypes).toEqual([])
      expect(user.gamingProfile.totalPlaytime).toBe(0)
      expect(user.gamingProfile.gamesPlayed).toBe(0)
      expect(user.gamingProfile.gamesCompleted).toBe(0)
      expect(user.gamingProfile.achievementsCount).toBe(0)
      expect(user.gamingProfile.averageRating).toBe(0)
      expect(user.gamingProfile.currentStreak).toBe(0)
      expect(user.gamingProfile.longestStreak).toBe(0)
      expect(user.gamingProfile.favoriteGames).toEqual([])
      expect(user.integrations).toEqual([])
      expect(user.privacy.profileVisibility).toBe('public')
      expect(user.privacy.sharePlaytime).toBe(true)
      expect(user.privacy.shareAchievements).toBe(true)
      expect(user.privacy.shareGameLibrary).toBe(false)
      expect(user.privacy.allowFriendRequests).toBe(true)
      expect(user.privacy.showOnlineStatus).toBe(true)
      expect(user.preferences.theme).toBe('dark')
      expect(user.preferences.language).toBe('en')
      expect(user.preferences.notifications.email).toBe(true)
      expect(user.preferences.notifications.push).toBe(true)
      expect(user.preferences.notifications.achievements).toBe(true)
      expect(user.preferences.notifications.recommendations).toBe(true)
      expect(user.notifications.friendActivity).toBe(true)
      expect(user.preferences.notifications.platformUpdates).toBe(false)
      expect(user.preferences.display.compactMode).toBe(false)
      expect(user.preferences.display.showGameCovers).toBe(true)
      expect(user.preferences.display.animateTransitions).toBe(true)
      expect(user.preferences.showRatings).toBe(true)
      expect(user.social.friends).toEqual([])
      expect(user.social.blockedUsers).toEqual([])
      expect(user.social.favoriteGenres).toEqual([])
      expect(user.social.customTags).toEqual([])
    })

    it('should use provided timezone when specified', () => {
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        timezone: 'America/New_York'
      }

      const user = createDefaultUser(userData)
      expect(user.timezone).toBe('America/New_York')
    })

    it('should use provided displayName when specified', () => {
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Custom Display Name',
        timezone: 'UTC'
      }

      const user = createDefaultUser(userData)
      expect(user.displayName).toBe('Custom Display Name')
    })
  })

  describe('PlaystyleArchetypeType', () => {
    it('should have all expected archetype types', () => {
      expect(PlaystyleArchetypeType.EXPLORER).toBe('explorer')
      expect(PlaystyleArchetypeType.ACHIEVER).toBe('achiever')
      expect(PlaystyleArchetypeType.STORYTELLER).toBe('storyteller')
      expect(PlaystyleArchetypeType.COMPETITOR).toBe('competitor')
      expect(PlaystyleArchetypeType.CREATOR).toBe('creator')
      expect(PlaystyleArchetypeType.SOCIALIZER).toBe('socializer')
    })
  })

  describe('MoodType', () => {
    it('should have all expected mood types', () => {
      expect(MoodType.NEUTRAL).toBe('neutral')
      expect(MoodType.COMPETITIVE).toBe('competitive')
      expect(MoodType.RELAXED).toBe('relaxed')
      expect(MoodType.FOCUSED).toBe('focused')
      expect(MoodType.SOCIAL).toBe('social')
      expect(MoodType.CREATIVE).toBe('creative')
      expect(MoodType.ADVENTUROUS).toBe('adventurous')
      expect(MoodType.STRATEGIC).toBe('strategic')
    })
  })
})

describe('UserMoodEntry', () => {
  describe('isValidUserMoodEntry', () => {
    it('should return true for valid mood entry', () => {
      const validEntry: any = {
        moodId: 'competitive',
        intensity: 5,
        timestamp: new Date(),
        context: 'Playing a competitive match',
        gameId: 'game-123'
      }

      expect(isValidUserMoodEntry(validEntry)).toBe(true)
    })

    it('should return false for invalid mood entry with intensity out of range', () => {
      const invalidEntry: any = {
        moodId: 'competitive',
        intensity: 15, // Invalid: should be 1-10
        timestamp: new Date(),
        context: 'Playing a competitive match',
        gameId: 'game-123'
      }

      expect(isValidUserMoodEntry(invalidEntry)).toBe(false)
    })

    it('should return false for invalid mood entry with invalid timestamp', () => {
      const invalidEntry: any = {
        moodId: 'competitive',
        intensity: 5,
        timestamp: 'invalid-date' as any,
        context: 'Playing a competitive match',
        gameId: 'game-123'
      }

      expect(isValidUserMoodEntry(invalidEntry)).toBe(false)
    })

    it('should return false for invalid mood entry with missing required fields', () => {
      const invalidEntry: any = {
        moodId: 'competitive',
        intensity: 5,
        timestamp: new Date(),
        context: 'Playing a competitive match'
        // Missing gameId
      }

      expect(isValidUserMoodEntry(invalidEntry)).toBe(false)
    })

    it('should return true for valid mood entry without optional fields', () => {
      const validEntry: any = {
        moodId: 'competitive',
        intensity: 5,
        timestamp: new Date()
        // context and gameId are optional
      }

      expect(isValidUserMoodEntry(validEntry)).toBe(true)
    })
  })
})

describe('CustomField', () => {
  it('should validate custom field with valid data', () => {
    const validField: any = {
      id: 'field-1',
      name: 'Favorite Color',
      value: 'blue',
      type: 'text',
      isPublic: true,
      order: 1
    }

      expect(validField.id).toBe('field-1')
      expect(validField.name).toBe('validField')
      expect(validField.value).toBe('blue')
      expect(validField.type).toBe('text')
      expect(validField.isPublic).toBe(true)
      expect(validField.order).toBe(1)
    })

    it('should validate custom field with valid type', () => {
      const validTypes = ['text', 'email', 'url', 'textarea']
      
      validTypes.forEach(type => {
        const validField: any = {
          id: 'field-1',
          name: 'Test Field',
          value: 'test',
          type: type as any,
          isPublic: false,
          order: 1
        }

        expect(validField.type).toBe(type)
      })
    })

    it('should validate custom field with boolean isPublic', () => {
      const publicField: any = {
        id: 'field-1',
        name: 'Public Field',
        value: 'test',
        type: 'text',
        isPublic: true,
        order: 1
      }

      const privateField: any = {
        id: 'field-2',
        name: 'Private Field',
        value: 'test',
        type: 'text',
        isPublic: false,
        order: 2
      }

      expect(publicField.isPublic).toBe(true)
      expect(privateField.isPublic).toBe(false)
    })
  })
