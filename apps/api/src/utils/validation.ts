// Backend validation utilities for GamePilot API
// Provides comprehensive validation for all authentication and user data

import { z } from 'zod'
import type { User, UserIntegration } from '@gamepilot/shared'

// Basic validation schemas
const emailSchema = z.string().email('Invalid email format')
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters long')
const usernameSchema = z.string().min(3, 'Username must be at least 3 characters long').max(50, 'Username must be less than 50 characters')
const userIdSchema = z.string().uuid('Invalid user ID format')
const platformSchema = z.enum(['steam', 'discord', 'youtube', 'twitch', 'spotify'])

// Authentication request schemas
export const loginRequestSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, 'Password is required')
})

export const registerRequestSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name must be less than 100 characters').optional(),
  timezone: z.string().optional()
})

export const accountDeletionRequestSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z.literal('DELETE', { message: 'Please type "DELETE" to confirm account deletion' })
})

export const passwordResetRequestSchema = z.object({
  email: emailSchema
})

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema
})

// User update schemas
export const updateUserRequestSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name must be less than 100 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  website: z.string().url('Invalid website URL').optional(),
  timezone: z.string().optional()
})

export const updatePreferencesSchema = z.object({
  theme: z.enum(['dark', 'light', 'auto']).optional(),
  language: z.string().length(2, 'Language must be a 2-letter code').optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    achievements: z.boolean().optional(),
    recommendations: z.boolean().optional(),
    friendActivity: z.boolean().optional(),
    platformUpdates: z.boolean().optional()
  }).optional(),
    display: z.object({
    compactMode: z.boolean().optional(),
    showGameCovers: z.boolean().optional(),
    animateTransitions: z.boolean().optional(),
    showRatings: z.boolean().optional(),
    accentColor: z.string().optional(),
    backgroundMode: z.enum(['solid', 'gradient', 'image']).optional(),
    backgroundImageUrl: z.string().url().optional().or(z.literal('')),
    animationLevel: z.enum(['low', 'medium', 'high']).optional(),
    density: z.enum(['compact', 'comfortable']).optional(),
    lightingMode: z.enum(['none', 'mood', 'rgb-sync']).optional(),
    borderRadius: z.number().min(0).max(50).optional(),
    borderWidth: z.number().min(0).max(10).optional(),
    shadowIntensity: z.number().min(0).max(100).optional(),
    glassOpacity: z.number().min(0).max(100).optional(),
    fontFamily: z.string().optional(),
    fontSize: z.string().optional(),
    fontWeight: z.number().min(100).max(900).optional(),
    animationStyle: z.string().optional(),
    hoverEffects: z.boolean().optional(),
    loadingAnimations: z.boolean().optional(),
    soundTheme: z.string().optional(),
    soundEnabled: z.boolean().optional(),
    volume: z.number().min(0).max(100).optional()
  }).optional(),
  perPageCustomisation: z.record(z.any()).optional()
})

export const updatePrivacySchema = z.object({
  profileVisibility: z.enum(['public', 'friends', 'private']).optional(),
  sharePlaytime: z.boolean().optional(),
  shareAchievements: z.boolean().optional(),
  shareGameLibrary: z.boolean().optional(),
  allowFriendRequests: z.boolean().optional(),
  showOnlineStatus: z.boolean().optional()
})

// Integration schemas
export const connectIntegrationSchema = z.object({
  platform: platformSchema,
  accessToken: z.string().min(1, 'Access token is required').optional(),
  refreshToken: z.string().optional(),
  scopes: z.array(z.string()).optional()
})

export const updateIntegrationSchema = z.object({
  isActive: z.boolean().optional(),
  syncConfig: z.object({
    autoSync: z.boolean().optional(),
    syncFrequency: z.number().min(1, 'Sync frequency must be at least 1 hour').max(168, 'Sync frequency must be less than 168 hours (1 week)').optional()
  }).optional()
})

// Validation error types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  data?: any
}

// Validation utility functions
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult {
  try {
    const validatedData = schema.parse(data)
    return {
      isValid: true,
      errors: [],
      data: validatedData
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
      return {
        isValid: false,
        errors
      }
    }
    
    return {
      isValid: false,
      errors: [{
        field: 'unknown',
        message: 'Validation failed',
        code: 'UNKNOWN_ERROR'
      }]
    }
  }
}

// Specific validation functions for auth endpoints
export function validateLoginRequest(data: unknown): ValidationResult {
  return validateRequest(loginRequestSchema, data)
}

export function validateRegisterRequest(data: unknown): ValidationResult {
  return validateRequest(registerRequestSchema, data)
}

export function validateAccountDeletionRequest(data: unknown): ValidationResult {
  return validateRequest(accountDeletionRequestSchema, data)
}

export function validatePasswordResetRequest(data: unknown): ValidationResult {
  return validateRequest(passwordResetRequestSchema, data)
}

export function validatePasswordResetConfirm(data: unknown): ValidationResult {
  return validateRequest(passwordResetConfirmSchema, data)
}

export function validateUpdateUserRequest(data: unknown): ValidationResult {
  return validateRequest(updateUserRequestSchema, data)
}

export function validateUpdatePreferencesRequest(data: unknown): ValidationResult {
  return validateRequest(updatePreferencesSchema, data)
}

export function validateUpdatePrivacyRequest(data: unknown): ValidationResult {
  return validateRequest(updatePrivacySchema, data)
}

export function validateConnectIntegrationRequest(data: unknown): ValidationResult {
  return validateRequest(connectIntegrationSchema, data)
}

export function validateUpdateIntegrationRequest(data: unknown): ValidationResult {
  return validateRequest(updateIntegrationSchema, data)
}

// Advanced validation functions
export function validateUserObject(user: any): ValidationResult {
  const errors: ValidationError[] = []
  
  if (!user || typeof user !== 'object') {
    errors.push({ field: 'user', message: 'User object is required', code: 'INVALID_TYPE' })
    return { isValid: false, errors }
  }
  
  // Basic field validation
  if (typeof user.id !== 'string') {
    errors.push({ field: 'id', message: 'User ID is required', code: 'INVALID_TYPE' })
  }
  
  if (typeof user.email !== 'string' || !emailSchema.safeParse(user.email).success) {
    errors.push({ field: 'email', message: 'Valid email is required', code: 'INVALID_EMAIL' })
  }
  
  if (typeof user.username !== 'string' || !usernameSchema.safeParse(user.username).success) {
    errors.push({ field: 'username', message: 'Valid username is required', code: 'INVALID_USERNAME' })
  }
  
  if (typeof user.displayName !== 'string' || user.displayName.length === 0) {
    errors.push({ field: 'displayName', message: 'Display name is required', code: 'INVALID_DISPLAY_NAME' })
  }
  
  // Date validation
  if (!(user.createdAt instanceof Date)) {
    errors.push({ field: 'createdAt', message: 'Valid creation date is required', code: 'INVALID_DATE' })
  }
  
  if (!(user.updatedAt instanceof Date)) {
    errors.push({ field: 'updatedAt', message: 'Valid update date is required', code: 'INVALID_DATE' })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateUserIntegrationObject(integration: any): ValidationResult {
  const errors: ValidationError[] = []
  
  if (!integration || typeof integration !== 'object') {
    errors.push({ field: 'integration', message: 'Integration object is required', code: 'INVALID_TYPE' })
    return { isValid: false, errors }
  }
  
  // Basic field validation
  if (typeof integration.id !== 'string') {
    errors.push({ field: 'id', message: 'Integration ID is required', code: 'INVALID_TYPE' })
  }
  
  if (typeof integration.userId !== 'string') {
    errors.push({ field: 'userId', message: 'User ID is required', code: 'INVALID_TYPE' })
  }
  
  if (!platformSchema.safeParse(integration.platform).success) {
    errors.push({ field: 'platform', message: 'Valid platform is required', code: 'INVALID_PLATFORM' })
  }
  
  if (typeof integration.externalUserId !== 'string') {
    errors.push({ field: 'externalUserId', message: 'External user ID is required', code: 'INVALID_TYPE' })
  }
  
  // Boolean validation
  if (typeof integration.isConnected !== 'boolean') {
    errors.push({ field: 'isConnected', message: 'Connection status must be boolean', code: 'INVALID_TYPE' })
  }
  
  if (typeof integration.isActive !== 'boolean') {
    errors.push({ field: 'isActive', message: 'Active status must be boolean', code: 'INVALID_TYPE' })
  }
  
  // Date validation
  if (!(integration.createdAt instanceof Date)) {
    errors.push({ field: 'createdAt', message: 'Valid creation date is required', code: 'INVALID_DATE' })
  }
  
  if (!(integration.updatedAt instanceof Date)) {
    errors.push({ field: 'updatedAt', message: 'Valid update date is required', code: 'INVALID_DATE' })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Sanitization functions
export function sanitizeString(input: unknown, maxLength?: number): string {
  if (typeof input !== 'string') return ''
  
  let sanitized = input.trim()
  
  if (maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }
  
  // Basic XSS prevention
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  return sanitized
}

export function sanitizeEmail(input: unknown): string {
  const email = sanitizeString(input, 254).toLowerCase()
  return email
}

export function sanitizeUsername(input: unknown): string {
  const username = sanitizeString(input, 50)
  // Allow only alphanumeric, underscore, and hyphen
  return username.replace(/[^a-zA-Z0-9_-]/g, '')
}

// Rate limiting validation
export function validateRateLimit(identifier: string, maxRequests: number, windowMs: number): {
  allowed: boolean
  remaining: number
  resetTime: Date
} {
  // This would typically use Redis or in-memory store
  // For now, return a mock implementation
  return {
    allowed: true,
    remaining: maxRequests - 1,
    resetTime: new Date(Date.now() + windowMs)
  }
}
