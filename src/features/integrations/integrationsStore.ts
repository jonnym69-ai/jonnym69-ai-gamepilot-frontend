import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { integrationsApi } from '../../services/integrationsApi';

// Integration types
export interface IntegrationState {
  steamConnected: boolean;
  discordConnected: boolean;
  youtubeConnected: boolean;
  gogConnected: boolean;
  epicConnected: boolean;
  
  // Additional integration data
  steamUsername?: string;
  steamAvatarUrl?: string;
  discordUsername?: string;
  youtubeChannelId?: string;
  gogUsername?: string;
  epicUsername?: string;
}

// Store interface
interface IntegrationsStore extends IntegrationState {
  // Actions
  setIntegration: (name: keyof IntegrationState, value: boolean) => void;
  setIntegrationData: (name: keyof IntegrationState, data: any) => void;
  loadIntegrationsFromServer: () => Promise<void>;
  syncIntegrationsToServer: () => Promise<void>;
  resetIntegrations: () => void;
  
  // Steam integration methods
  connectSteam: () => Promise<{
    success: boolean;
    username: string;
    avatarUrl: string;
  }>;
  disconnectSteam: () => Promise<{ success: boolean }>;
  
  // Discord integration methods
  connectDiscord: () => Promise<{
    success: boolean;
    username: string;
  }>;
  disconnectDiscord: () => Promise<{ success: boolean }>;
}

// Default integration state
const defaultIntegrationState: IntegrationState = {
  steamConnected: false,
  discordConnected: false,
  youtubeConnected: false,
  gogConnected: false,
  epicConnected: false,
};

// Create the store
export const useIntegrationsStore = create<IntegrationsStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...defaultIntegrationState,

        // Actions
        setIntegration: (name, value) =>
          set(() => ({
            [name]: value,
          })),

        setIntegrationData: (name, data) =>
          set(() => ({
            [name]: data,
          })),

        loadIntegrationsFromServer: async () => {
          try {
            const data = await integrationsApi.getIntegrations();
            set(data);
          } catch (error) {
            console.error('Failed to load integrations from server:', error);
            // Keep current state if server fails
          }
        },

        syncIntegrationsToServer: async () => {
          try {
            const currentState = get();
            await integrationsApi.setIntegrations(currentState);
          } catch (error) {
            console.error('Failed to sync integrations to server:', error);
          }
        },

        resetIntegrations: () =>
          set(defaultIntegrationState),

        // Steam integration methods
        connectSteam: async () => {
          try {
            const steamData = await integrationsApi.connectSteam();
            set(() => ({
              steamConnected: steamData.success,
              steamUsername: steamData.username,
              steamAvatarUrl: steamData.avatarUrl,
            }));
            return steamData;
          } catch (error) {
            console.error('Failed to connect Steam:', error);
            throw error;
          }
        },

        disconnectSteam: async () => {
          try {
            const result = await integrationsApi.disconnectSteam();
            set(() => ({
              steamConnected: false,
              steamUsername: undefined,
              steamAvatarUrl: undefined,
            }));
            return result;
          } catch (error) {
            console.error('Failed to disconnect Steam:', error);
            throw error;
          }
        },

        // Discord integration methods
        connectDiscord: async () => {
          try {
            const discordData = await integrationsApi.connectDiscord();
            set(() => ({
              discordConnected: discordData.success,
              discordUsername: discordData.username,
            }));
            return discordData;
          } catch (error) {
            console.error('Failed to connect Discord:', error);
            throw error;
          }
        },

        disconnectDiscord: async () => {
          try {
            const result = await integrationsApi.disconnectDiscord();
            set(() => ({
              discordConnected: false,
              discordUsername: undefined,
            }));
            return result;
          } catch (error) {
            console.error('Failed to disconnect Discord:', error);
            throw error;
          }
        },
      }),
      {
        name: 'gamepilot-integrations',
        version: 1,
      }
    ),
    {
      name: 'integrations-store',
    }
  )
);

// Hooks for components
export const useIntegrations = () => {
  const store = useIntegrationsStore();
  return {
    steamConnected: store.steamConnected,
    discordConnected: store.discordConnected,
    youtubeConnected: store.youtubeConnected,
    gogConnected: store.gogConnected,
    epicConnected: store.epicConnected,
    steamUsername: store.steamUsername,
    steamAvatarUrl: store.steamAvatarUrl,
    discordUsername: store.discordUsername,
    youtubeChannelId: store.youtubeChannelId,
    gogUsername: store.gogUsername,
    epicUsername: store.epicUsername,
  };
};

export const useIntegrationsActions = () => {
  const store = useIntegrationsStore();
  return {
    setIntegration: store.setIntegration,
    setIntegrationData: store.setIntegrationData,
    loadIntegrationsFromServer: store.loadIntegrationsFromServer,
    syncIntegrationsToServer: store.syncIntegrationsToServer,
    resetIntegrations: store.resetIntegrations,
    connectSteam: store.connectSteam,
    disconnectSteam: store.disconnectSteam,
    connectDiscord: store.connectDiscord,
    disconnectDiscord: store.disconnectDiscord,
  };
};
