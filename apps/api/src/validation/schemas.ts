import { z } from 'zod'

// Common validation patterns
const emailSchema = z.string().email('Invalid email format').max(255, 'Email too long')
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long')
const usernameSchema = z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long').regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
const idSchema = z.string().uuid('Invalid ID format')

// Authentication schemas
export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name too long').optional().default(''),
  timezone: z.string().optional().default('UTC')
})

export const loginSchema = z.object({
  username: z.union([
    usernameSchema,
    emailSchema
  ]),
  password: z.string().min(1, 'Password is required')
})

export const updateProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name too long').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  location: z.string().max(100, 'Location too long').optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  timezone: z.string().optional(),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal(''))
})

// Game schemas
export const addGameSchema = z.object({
  title: z.string().min(1, 'Game title is required').max(200, 'Title too long'),
  genres: z.array(z.string()).max(10, 'Too many genres').optional(),
  platforms: z.array(z.string()).max(5, 'Too many platforms').optional(),
  tags: z.array(z.string()).max(20, 'Too many tags').optional(),
  rating: z.number().min(0, 'Rating must be between 0 and 5').max(5, 'Rating must be between 0 and 5').optional(),
  status: z.enum(['unplayed', 'playing', 'completed', 'paused', 'abandoned']).optional(),
  notes: z.string().max(1000, 'Notes too long').optional()
})

export const updateGameSchema = z.object({
  id: idSchema,
  title: z.string().min(1, 'Game title is required').max(200, 'Title too long').optional(),
  genres: z.array(z.string()).max(10, 'Too many genres').optional(),
  platforms: z.array(z.string()).max(5, 'Too many platforms').optional(),
  tags: z.array(z.string()).max(20, 'Too many tags').optional(),
  rating: z.number().min(0, 'Rating must be between 0 and 5').max(5, 'Rating must be between 0 and 5').optional(),
  status: z.enum(['unplayed', 'playing', 'completed', 'paused', 'abandoned']).optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  playtime: z.number().min(0, 'Playtime cannot be negative').optional()
})

export const deleteGameSchema = z.object({
  id: idSchema
})

// Mood and persona schemas
export const moodEntrySchema = z.object({
  mood: z.string().min(1, 'Mood is required').max(50, 'Mood too long'),
  intensity: z.number().min(1, 'Intensity must be between 1 and 10').max(10, 'Intensity must be between 1 and 10'),
  triggers: z.array(z.string()).max(10, 'Too many triggers').optional(),
  activities: z.array(z.string()).max(10, 'Too many activities').optional(),
  notes: z.string().max(500, 'Notes too long').optional()
})

export const personaUpdateSchema = z.object({
  traits: z.array(z.string()).max(20, 'Too many traits').optional(),
  preferences: z.object({
    genres: z.array(z.string()).max(10, 'Too many genre preferences').optional(),
    playtimes: z.array(z.string()).max(5, 'Too many preferred playtimes').optional(),
    socialLevel: z.enum(['solo', 'small', 'large']).optional(),
    competitiveness: z.enum(['casual', 'moderate', 'competitive']).optional()
  }).optional()
})

// Recommendation schemas
export const recommendationRequestSchema = z.object({
  mood: z.string().optional(),
  genres: z.array(z.string()).max(5, 'Too many genres').optional(),
  platforms: z.array(z.string()).max(3, 'Too many platforms').optional(),
  playtime: z.object({
    min: z.number().min(0, 'Minimum playtime cannot be negative').optional(),
    max: z.number().min(0, 'Maximum playtime cannot be negative').optional()
  }).optional(),
  limit: z.number().min(1, 'Limit must be at least 1').max(50, 'Limit cannot exceed 50').optional().default(10)
})

// Steam API Key schemas
export const steamApiKeySchema = z.object({
  apiKey: z.string()
    .min(32, 'Steam API key must be exactly 32 characters')
    .max(32, 'Steam API key must be exactly 32 characters')
    .regex(/^[A-F0-9]{32}$/i, 'Steam API key must contain only hexadecimal characters (0-9, A-F)')
})

export const steamApiKeyResponseSchema = z.object({
  success: z.boolean(),
  hasApiKey: z.boolean(),
  maskedKey: z.string().nullable().optional(),
  message: z.string().optional()
})

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').optional().default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional().default(20)
})

export const gameFilterSchema = z.object({
  genre: z.string().optional(),
  platform: z.string().optional(),
  status: z.enum(['unplayed', 'playing', 'completed', 'paused', 'abandoned']).optional(),
  rating: z.coerce.number().min(0, 'Rating must be between 0 and 5').max(5, 'Rating must be between 0 and 5').optional(),
  search: z.string().max(100, 'Search term too long').optional()
}).merge(paginationSchema)

// Export validation middleware factory
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid input data',
          details: errors
        })
      }
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Validation error occurred'
      })
    }
  }
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.query)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid query parameters',
          details: errors
        })
      }
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Query validation error occurred'
      })
    }
  }
}

export function validateParams<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.params)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid path parameters',
          details: errors
        })
      }
      return res.status(500).json({
        error: 'Internal server error',
        message: 'Parameter validation error occurred'
      })
    }
  }
}
