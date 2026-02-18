// Canonical UserIntegration model for GamePilot platform
// This model unifies all Integration interfaces across the monorepo

import { PlatformCode } from '../types'

// Core UserIntegration interface - the canonical model
export interface UserIntegration {
  // Primary identifiers
  id: string
  userId: string
  platform: PlatformCode
  
  // External platform identifiers
  externalUserId: string // Steam ID, Discord User ID, YouTube Channel ID, etc.
  externalUsername?: string // Platform-specific username
  
  // Authentication tokens
  accessToken?: string
  refreshToken?: string
  expiresAt?: Date
  
  // OAuth scopes and permissions
  scopes: string[]
  
  // Integration status and metadata
  status: IntegrationStatus
  isActive: boolean
  isConnected: boolean
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastSyncAt?: Date
  lastUsedAt?: Date
  
  // Platform-specific metadata (JSON)
  metadata?: Record<string, any>
  
  // Sync configuration
  syncConfig: {
    autoSync: boolean
    syncFrequency: number // hours
    lastSyncAt?: Date
    errorCount: number
    maxRetries: number
  }
}

// Integration status enum
export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONNECTED = 'disconnected',
  EXPIRED = 'expired',
  ERROR = 'error'
}

// Platform metadata interfaces
export interface SteamIntegrationMetadata {
  steamId: string
  personaName: string
  profileUrl: string
  avatar: string
  personaState: number
  gameExtraInfo?: string
  gameId?: string
}

export interface DiscordIntegrationMetadata {
  id: string
  username: string
  discriminator: string
  avatar: string
  bot: boolean
  verified: boolean
  email?: string
  flags: number
  premiumType?: number
  globalName?: string
  avatarUrl?: string
  bannerUrl?: string
  accentColor?: number
}

export interface YouTubeIntegrationMetadata {
  channelTitle: string
  subscriberCount: number
  videoCount: number
  viewCount: number
  publishedAt: Date
}

// Type guards and utilities

export function isValidUserIntegration(integration: any): integration is UserIntegration {
  return (
    integration &&
    typeof integration.id === 'string' &&
    typeof integration.userId === 'string' &&
    typeof integration.platform === 'string' &&
    typeof integration.externalUserId === 'string' &&
    (typeof integration.externalUsername === 'string' || integration.externalUsername === undefined) &&
    typeof integration.isConnected === 'boolean' &&
    typeof integration.isActive === 'boolean' &&
    typeof integration.status === 'string' &&
    Object.values(IntegrationStatus).includes(integration.status) &&
    integration.createdAt instanceof Date &&
    integration.updatedAt instanceof Date &&
    Array.isArray(integration.scopes) &&
    isValidSyncConfig(integration.syncConfig) &&
    (integration.expiresAt === undefined || integration.expiresAt instanceof Date) &&
    (integration.lastSyncAt === undefined || integration.lastSyncAt instanceof Date) &&
    (integration.lastUsedAt === undefined || integration.lastUsedAt instanceof Date) &&
    (integration.metadata === undefined || typeof integration.metadata === 'object')
  )
}

export function isValidSyncConfig(config: any): boolean {
  return (
    config &&
    typeof config.autoSync === 'boolean' &&
    typeof config.syncFrequency === 'number' &&
    config.syncFrequency > 0 &&
    typeof config.errorCount === 'number' &&
    config.errorCount >= 0 &&
    typeof config.maxRetries === 'number' &&
    config.maxRetries >= 0 &&
    (config.lastSyncAt === undefined || config.lastSyncAt instanceof Date)
  )
}

export function isValidSteamIntegrationMetadata(metadata: any): boolean {
  return (
    metadata &&
    typeof metadata.steamId === 'string' &&
    typeof metadata.personaName === 'string' &&
    typeof metadata.profileUrl === 'string' &&
    typeof metadata.avatar === 'string' &&
    typeof metadata.personaState === 'number' &&
    (metadata.gameExtraInfo === undefined || typeof metadata.gameExtraInfo === 'string') &&
    (metadata.gameId === undefined || typeof metadata.gameId === 'string')
  )
}

export function isValidDiscordIntegrationMetadata(metadata: any): boolean {
  return (
    metadata &&
    typeof metadata.id === 'string' &&
    typeof metadata.username === 'string' &&
    typeof metadata.discriminator === 'string' &&
    typeof metadata.avatar === 'string' &&
    typeof metadata.bot === 'boolean' &&
    typeof metadata.verified === 'boolean' &&
    (metadata.email === undefined || typeof metadata.email === 'string') &&
    typeof metadata.flags === 'number' &&
    (metadata.premiumType === undefined || typeof metadata.premiumType === 'number') &&
    (metadata.globalName === undefined || typeof metadata.globalName === 'string') &&
    (metadata.avatarUrl === undefined || typeof metadata.avatarUrl === 'string') &&
    (metadata.bannerUrl === undefined || typeof metadata.bannerUrl === 'string') &&
    (metadata.accentColor === undefined || typeof metadata.accentColor === 'number')
  )
}

export function isValidYouTubeIntegrationMetadata(metadata: any): boolean {
  return (
    metadata &&
    typeof metadata.channelTitle === 'string' &&
    typeof metadata.subscriberCount === 'number' &&
    metadata.subscriberCount >= 0 &&
    typeof metadata.videoCount === 'number' &&
    metadata.videoCount >= 0 &&
    typeof metadata.viewCount === 'number' &&
    metadata.viewCount >= 0 &&
    metadata.publishedAt instanceof Date
  )
}

export function createDefaultUserIntegration(userData: {
  id: string
  userId: string
  platform: PlatformCode
  externalUserId: string
  externalUsername: string
}): UserIntegration {
  return {
    id: userData.id,
    userId: userData.userId,
    platform: userData.platform,
    externalUserId: userData.externalUserId,
    externalUsername: userData.externalUsername,
    scopes: [],
    status: IntegrationStatus.INACTIVE,
    isActive: false,
    isConnected: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    syncConfig: {
      autoSync: true,
      syncFrequency: 12,
      errorCount: 0,
      maxRetries: 3
    }
  }
}

// Integration validation
export interface IntegrationValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validateUserIntegration(integration: UserIntegration): IntegrationValidation {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!integration.id) errors.push('Integration ID is required')
  if (!integration.userId) errors.push('User ID is required')
  if (!integration.platform) errors.push('Platform is required')
  if (!integration.externalUserId) errors.push('External user ID is required')
  
  if (integration.isConnected && !integration.accessToken) {
    warnings.push('Connected integration has no access token')
  }
  
  if (integration.expiresAt && integration.expiresAt < new Date()) {
    errors.push('Access token has expired')
  }
  
  if (integration.syncConfig.errorCount > 5) {
    warnings.push('High error count detected')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Integration status helpers
export function isIntegrationActive(integration: UserIntegration): boolean {
  return integration.isConnected && integration.status === IntegrationStatus.ACTIVE
}

export function isIntegrationExpired(integration: UserIntegration): boolean {
  return integration.status === IntegrationStatus.EXPIRED || 
         (!!(integration.expiresAt && integration.expiresAt < new Date()))
}

export function isIntegrationHealthy(integration: UserIntegration): boolean {
  return isIntegrationActive(integration) && 
         !isIntegrationExpired(integration) && 
         integration.syncConfig.errorCount < 3
}
