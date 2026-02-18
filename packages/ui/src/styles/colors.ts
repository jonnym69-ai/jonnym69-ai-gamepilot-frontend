// Color Tokens and Accent System for GamePilot Design System

// Base Color Palette
export const colors = {
  // Neutral Colors
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    850: '#1A202C',
    900: '#111827',
    950: '#030712'
  },
  black: '#000000',

  // Gaming Primary Colors
  gaming: {
    primary: '#8B5CF6',      // Purple
    secondary: '#3B82F6',     // Blue
    accent: '#EC4899',        // Pink
    dark: '#0F172A',          // Dark background
    darker: '#020617',         // Darkest background
    light: '#F8FAFC',         // Light background
    lighter: '#FFFFFF'         // Lightest background
  },

  // Accent Colors
  accent: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E'
  },

  // Semantic Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D'
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F'
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D'
  },

  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A'
  }
}

// Accent System - Dynamic color combinations
export const accentSystem = {
  // Primary Accent Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
    secondary: 'linear-gradient(135deg, #3B82F6 0%, #EC4899 100%)',
    accent: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
    success: 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
    warning: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
    error: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    info: 'linear-gradient(135deg, #3B82F6 0%, #0EA5E9 100%)',
    
    // Cinematic gradients
    cinematic: {
      dawn: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #8B5CF6 100%)',
      dusk: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)',
      midnight: 'linear-gradient(135deg, #1E293B 0%, #0F172A 50%, #020617 100%)',
      aurora: 'linear-gradient(135deg, #10B981 0%, #3B82F6 50%, #8B5CF6 100%)',
      neon: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #06B6D4 100%)',
      retro: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #8B5CF6 100%)'
    }
  },

  // Glow Effects
  glows: {
    primary: '0 0 20px rgba(139, 92, 246, 0.5)',
    secondary: '0 0 20px rgba(59, 130, 246, 0.5)',
    accent: '0 0 20px rgba(236, 72, 153, 0.5)',
    success: '0 0 20px rgba(34, 197, 94, 0.5)',
    warning: '0 0 20px rgba(245, 158, 11, 0.5)',
    error: '0 0 20px rgba(239, 68, 68, 0.5)',
    info: '0 0 20px rgba(59, 130, 246, 0.5)'
  },

  // Shadow System
  shadows: {
    // Base shadows
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    
    // Cinematic shadows
    cinematic: {
      soft: '0 8px 32px rgba(139, 92, 246, 0.1)',
      medium: '0 16px 48px rgba(139, 92, 246, 0.15)',
      strong: '0 24px 64px rgba(139, 92, 246, 0.2)',
      glow: '0 0 40px rgba(139, 92, 246, 0.3)',
      epic: '0 32px 80px rgba(139, 92, 246, 0.4)'
    }
  },

  // Border Colors
  borders: {
    default: 'rgba(255, 255, 255, 0.1)',
    focus: 'rgba(139, 92, 246, 0.5)',
    hover: 'rgba(139, 92, 246, 0.3)',
    active: 'rgba(139, 92, 246, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.05)'
  }
}

// Border Colors (exported separately)
export const borderColors = {
  default: 'rgba(255, 255, 255, 0.1)',
  focus: 'rgba(139, 92, 246, 0.5)',
  hover: 'rgba(139, 92, 246, 0.3)',
  active: 'rgba(139, 92, 246, 0.7)',
  disabled: 'rgba(255, 255, 255, 0.05)'
}

// Theme Configurations
export const themes = {
  dark: {
    background: colors.gaming.darker,
    surface: colors.gaming.dark,
    surfaceLight: colors.gray[900],
    text: colors.white,
    textSecondary: colors.gray[300],
    textMuted: colors.gray[500],
    border: borderColors.default,
    accent: colors.gaming.primary
  },
  
  light: {
    background: colors.gaming.lighter,
    surface: colors.white,
    surfaceLight: colors.gray[50],
    text: colors.gray[900],
    textSecondary: colors.gray[700],
    textMuted: colors.gray[500],
    border: colors.gray[200],
    accent: colors.gaming.primary
  },

  // Gaming-specific themes
  gaming: {
    neon: {
      background: colors.gaming.darker,
      surface: 'rgba(139, 92, 246, 0.1)',
      accent: colors.gaming.primary,
      text: colors.white,
      glow: accentSystem.glows.primary
    },
    
    retro: {
      background: colors.gaming.darker,
      surface: 'rgba(245, 158, 11, 0.1)',
      accent: colors.warning[500],
      text: colors.white,
      glow: accentSystem.glows.warning
    },
    
    cyberpunk: {
      background: colors.gaming.darker,
      surface: 'rgba(236, 72, 153, 0.1)',
      accent: colors.gaming.accent,
      text: colors.white,
      glow: accentSystem.glows.accent
    }
  }
}

// Color Utilities
export const colorUtils = {
  // Get color with opacity
  withOpacity: (color: string, opacity: number) => {
    if (color.startsWith('#')) {
      const hex = color.slice(1)
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }
    return color
  },

  // Generate gradient string
  gradient: (colors: string[], angle = 135) => {
    return `linear-gradient(${angle}deg, ${colors.join(', ')})`
  },

  // Get contrast color
  getContrast: (color: string) => {
    // Simple contrast calculation - in real app, use more sophisticated algorithm
    return parseInt(color.slice(1), 16) > 0xFFFFFF / 2 ? '#000000' : '#FFFFFF'
  },

  // Mix two colors
  mix: (color1: string, _color2: string, _ratio = 0.5) => {
    // Simplified color mixing - in real app, use proper color space conversion
    return color1 // Placeholder
  }
}

// CSS Custom Properties
export const cssVariables = {
  // Base colors
  '--color-primary': colors.gaming.primary,
  '--color-secondary': colors.gaming.secondary,
  '--color-accent': colors.gaming.accent,
  '--color-background': colors.gaming.darker,
  '--color-surface': colors.gaming.dark,
  '--color-text': colors.white,
  '--color-text-secondary': colors.gray[300],
  '--color-border': borderColors.default,

  // Semantic colors
  '--color-success': colors.success[500],
  '--color-warning': colors.warning[500],
  '--color-error': colors.error[500],
  '--color-info': colors.info[500],

  // Gradients
  '--gradient-primary': accentSystem.gradients.primary,
  '--gradient-secondary': accentSystem.gradients.secondary,
  '--gradient-accent': accentSystem.gradients.accent,

  // Shadows
  '--shadow-cinematic': accentSystem.shadows.cinematic.medium,
  '--shadow-glow': accentSystem.shadows.cinematic.glow,

  // Transitions
  '--transition-fast': '150ms ease-in-out',
  '--transition-normal': '250ms ease-in-out',
  '--transition-slow': '350ms ease-in-out'
} as const

// Tailwind CSS Extension
export const tailwindExtension = {
  theme: {
    extend: {
      colors: {
        ...colors,
        accent: colors.accent,
        gaming: colors.gaming
      },
      backgroundImage: {
        'gradient-primary': accentSystem.gradients.primary,
        'gradient-secondary': accentSystem.gradients.secondary,
        'gradient-accent': accentSystem.gradients.accent
      },
      boxShadow: {
        'cinematic': accentSystem.shadows.cinematic.medium,
        'cinematic-soft': accentSystem.shadows.cinematic.soft,
        'cinematic-strong': accentSystem.shadows.cinematic.strong,
        'glow-primary': accentSystem.glows.primary,
        'glow-secondary': accentSystem.glows.secondary,
        'glow-accent': accentSystem.glows.accent
      }
    }
  }
}
