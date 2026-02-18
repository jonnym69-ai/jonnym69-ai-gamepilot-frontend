// Main exports for GamePilot Design System

// Styles
export * from './styles/typography'
export * from './styles/colors'
export * from './styles/motion'

// Layout Components
export * from './components/layout'

// UI Components
export * from './components/Button'
export * from './components/Card'
export * from './components/Panel'
export * from './components/Input'
export * from './components/Spotlight'
export * from './components/GameTile'
export * from './components/MoodBar'
export * from './components/ActivityPulse'

// Utilities
export * from './utils/cn'

// Design System Configuration
export { tailwindExtension } from './styles/colors'
export { tailwindMotionExtension } from './styles/motion'

// Re-export commonly used combinations
export { typography, textStyles, textAnimations, responsiveText } from './styles/typography'
export { colors, accentSystem, themes, cssVariables } from './styles/colors'
export { animations, transitions, durations, easings } from './styles/motion'
