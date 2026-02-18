// Core data types for GamePilot platform
export * from './types'

// Models
export * from './models'

// Constants
export * from './constants'

// Schemas
export * from './schemas'

// Utils
export * from './utils'

// Adapters
export * from './adapters/steamAdapter'

// Persona
export * from './persona/identityCore'
export * from './persona/synthesis'
export * from './persona/moodEngine'
export * from './persona/reflection'

// Re-export specific types that API expects
export type { User } from './models/user'
export type { UserIntegration } from './models/integration'
export { IntegrationStatus } from './models/integration'
export type { IdentityCore } from './persona/identityCore'
export { buildPersonaSignals, buildPersonaTraits } from './persona/synthesis'
export { buildMoodState } from './persona/moodEngine'
export { buildReflection } from './persona/reflection'
