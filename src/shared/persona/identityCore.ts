/**
 * Core identity interfaces for persona system
 */

export interface IdentityCore {
  id: string
  userId: string
  displayName: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
  signals: any
  preferences: any
  traits: any
}

export interface PersonaCore {
  identity: IdentityCore
  archetype: string
  moods: string[]
  playPatterns: Record<string, number>
  motivations: string[]
  confidence: number
}
