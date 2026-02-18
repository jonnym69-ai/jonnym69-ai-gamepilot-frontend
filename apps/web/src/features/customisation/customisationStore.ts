import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Customisation types
export type Theme = 'dark' | 'light' | 'system' | 'auto' | 'solarpunk' | 'retro-arcade' | 'cyberpunk' | 'nature-gaming' | 'monochrome' | 'pastel';
export type BackgroundMode = 'solid' | 'gradient' | 'image';
export type AnimationLevel = 'low' | 'medium' | 'high';
export type Density = 'compact' | 'comfortable';
export type LightingMode = 'none' | 'mood' | 'rgb-sync';

// Shape types
export type BoxShape = 'rounded' | 'square' | 'hexagon' | 'octagon' | 'diamond' | 'pill' | 'circle';
export type ComponentStyle = 'glass-morphism' | 'solid' | 'outline' | 'neon' | 'minimal';

// New types for enhanced features
export type FontFamily = 'inter' | 'jetbrains-mono' | 'space-mono' | 'roboto' | 'open-sans' | 'poppins';
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type SoundTheme = 'cyberpunk' | 'retro' | 'minimal' | 'epic' | 'nature';
export type AnimationStyle = 'smooth' | 'bounce' | 'slide' | 'fade' | 'glow';

// Global customisation settings
export interface GlobalCustomisationSettings {
  theme: Theme;
  accentColor: string;
  backgroundMode: BackgroundMode;
  backgroundImageUrl?: string;
  animationLevel: AnimationLevel;
  density: Density;
  lightingMode: LightingMode;
  rgbSyncEnabled: boolean;
  
  // Advanced shape and styling
  defaultBoxShape: BoxShape;
  defaultComponentStyle: ComponentStyle;
  borderRadius: number; // 0-50px
  borderWidth: number; // 0-10px
  shadowIntensity: number; // 0-100%
  glassOpacity: number; // 0-100%
  
  // Component-specific shapes
  cardShape: BoxShape;
  buttonShape: BoxShape;
  inputShape: BoxShape;
  modalShape: BoxShape;
  
  // Component-specific styles
  cardStyle: ComponentStyle;
  buttonStyle: ComponentStyle;
  inputStyle: ComponentStyle;
  modalStyle: ComponentStyle;
  
  // Enhanced typography
  fontFamily: FontFamily;
  fontSize: FontSize;
  fontWeight: number; // 100-900
  
  // Enhanced animations
  animationStyle: AnimationStyle;
  hoverEffects: boolean;
  loadingAnimations: boolean;
  
  // Sound themes
  soundTheme: SoundTheme;
  soundEnabled: boolean;
  volume: number; // 0-100
}

// Per-page customisation overrides
export interface PageCustomisationSettings {
  backgroundMode?: BackgroundMode;
  backgroundImageUrl?: string;
  accentColor?: string;
  animationLevel?: AnimationLevel;
  density?: Density;
  lightingMode?: LightingMode;
}

// Complete customisation state
export interface CustomisationState {
  global: GlobalCustomisationSettings;
  perPage: Record<string, PageCustomisationSettings>;
}

// Default settings
const defaultGlobalSettings: GlobalCustomisationSettings = {
  theme: 'solarpunk', // Changed from 'dark' to break away from generic AI colors
  accentColor: '#10b981', // Changed to refined emerald green
  backgroundMode: 'gradient',
  backgroundImageUrl: undefined,
  animationLevel: 'medium',
  density: 'comfortable',
  lightingMode: 'none',
  rgbSyncEnabled: false,
  
  // Advanced shape and styling defaults
  defaultBoxShape: 'rounded',
  defaultComponentStyle: 'glass-morphism',
  borderRadius: 12,
  borderWidth: 1,
  shadowIntensity: 50,
  glassOpacity: 80,
  
  // Component-specific shapes
  cardShape: 'rounded',
  buttonShape: 'rounded',
  inputShape: 'rounded',
  modalShape: 'rounded',
  
  // Component-specific styles
  cardStyle: 'glass-morphism',
  buttonStyle: 'glass-morphism',
  inputStyle: 'glass-morphism',
  modalStyle: 'glass-morphism',
  
  // Enhanced typography defaults
  fontFamily: 'inter',
  fontSize: 'base',
  fontWeight: 400,
  
  // Enhanced animations defaults
  animationStyle: 'smooth',
  hoverEffects: true,
  loadingAnimations: true,
  
  // Sound themes defaults
  soundTheme: 'minimal',
  soundEnabled: false,
  volume: 50,
};

// Store interface
interface CustomisationStore extends CustomisationState {
  // Actions
  setGlobalSettings: (settings: Partial<GlobalCustomisationSettings>) => void;
  setPageSettings: (pageId: string, settings: PageCustomisationSettings) => void;
  resetPageSettings: (pageId: string) => void;
  resetAllSettings: () => void;
  
  // Getters
  getMergedSettings: (pageId?: string) => GlobalCustomisationSettings;
}

// Create the store
export const useCustomisationStore = create<CustomisationStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        global: defaultGlobalSettings,
        perPage: {},

        // Actions
        setGlobalSettings: (settings) =>
          set((state) => ({
            global: { ...state.global, ...settings },
          })),

        setPageSettings: (pageId, settings) =>
          set((state) => ({
            perPage: {
              ...state.perPage,
              [pageId]: settings,
            },
          })),

        resetPageSettings: (pageId) =>
          set((state) => {
            const newPerPage = { ...state.perPage };
            delete newPerPage[pageId];
            return { perPage: newPerPage };
          }),

        resetAllSettings: () =>
          set({
            global: defaultGlobalSettings,
            perPage: {},
          }),

        // Getters
        getMergedSettings: (pageId) => {
          const state = get();
          const pageSettings = pageId ? state.perPage[pageId] : {};
          
          return {
            theme: state.global.theme,
            accentColor: pageSettings?.accentColor ?? state.global.accentColor,
            backgroundMode: pageSettings?.backgroundMode ?? state.global.backgroundMode,
            backgroundImageUrl: pageSettings?.backgroundImageUrl ?? state.global.backgroundImageUrl,
            animationLevel: pageSettings?.animationLevel ?? state.global.animationLevel,
            density: pageSettings?.density ?? state.global.density,
            lightingMode: pageSettings?.lightingMode ?? state.global.lightingMode,
            rgbSyncEnabled: state.global.rgbSyncEnabled,
            
            // Advanced shape and styling
            defaultBoxShape: state.global.defaultBoxShape,
            defaultComponentStyle: state.global.defaultComponentStyle,
            borderRadius: state.global.borderRadius,
            borderWidth: state.global.borderWidth,
            shadowIntensity: state.global.shadowIntensity,
            glassOpacity: state.global.glassOpacity,
            
            // Component-specific shapes
            cardShape: state.global.cardShape,
            buttonShape: state.global.buttonShape,
            inputShape: state.global.inputShape,
            modalShape: state.global.modalShape,
            
            // Component-specific styles
            cardStyle: state.global.cardStyle,
            buttonStyle: state.global.buttonStyle,
            inputStyle: state.global.inputStyle,
            modalStyle: state.global.modalStyle,
            
            // Enhanced typography
            fontFamily: state.global.fontFamily,
            fontSize: state.global.fontSize,
            fontWeight: state.global.fontWeight,
            
            // Enhanced animations
            animationStyle: state.global.animationStyle,
            hoverEffects: state.global.hoverEffects,
            loadingAnimations: state.global.loadingAnimations,
            
            // Sound themes
            soundTheme: state.global.soundTheme,
            soundEnabled: state.global.soundEnabled,
            volume: state.global.volume,
          };
        },
      }),
      {
        name: 'gamepilot-customisation',
        version: 1,
      }
    ),
    {
      name: 'customisation-store',
    }
  )
);

// Hooks for components
export const useCustomisation = (pageId?: string) => {
  const store = useCustomisationStore();
  return store.getMergedSettings(pageId);
};

export const useCustomisationActions = () => {
  const store = useCustomisationStore();
  return {
    setGlobalSettings: store.setGlobalSettings,
    setPageSettings: store.setPageSettings,
    resetPageSettings: store.resetPageSettings,
    resetAllSettings: store.resetAllSettings,
  };
};

// Helper to get current page ID from route
export const getCurrentPageId = (): string => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof window.location === 'undefined') {
    return 'default';
  }
  
  const path = window.location.pathname;
  
  // Map routes to page IDs
  if (path === '/' || path === '/home') return 'home';
  if (path.startsWith('/library')) return 'library';
  if (path.startsWith('/analytics')) return 'analytics';
  if (path.startsWith('/identity')) return 'identity';
  if (path.startsWith('/settings')) return 'settings';
  if (path.startsWith('/customisation')) return 'customisation';
  
  // Default fallback
  return 'default';
};
