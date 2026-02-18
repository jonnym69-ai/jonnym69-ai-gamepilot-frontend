import { IntegrationState } from '../features/integrations/integrationsStore';

// Mock storage for integration data (in a real app, this would be a database)
let mockIntegrationData: IntegrationState = {
  steamConnected: false,
  discordConnected: false,
  youtubeConnected: false,
  gogConnected: false,
  epicConnected: false,
};

// Mock API endpoints for development
export const integrationsApi = {
  // GET /api/integrations/get
  async getIntegrations(): Promise<IntegrationState> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return { ...mockIntegrationData };
  },

  // POST /api/integrations/set
  async setIntegrations(data: Partial<IntegrationState>): Promise<IntegrationState> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Update mock data
    mockIntegrationData = { ...mockIntegrationData, ...data };
    
    return { ...mockIntegrationData };
  },

  // POST /api/integrations/steam/connect
  async connectSteam(): Promise<{
    success: boolean;
    username: string;
    avatarUrl: string;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock successful Steam connection
    const mockSteamData = {
      success: true,
      username: "DemoUser",
      avatarUrl: "/demo.jpg", // Use the demo.jpg in public folder
    };
    
    // Update integration state
    mockIntegrationData.steamConnected = true;
    mockIntegrationData.steamUsername = mockSteamData.username;
    mockIntegrationData.steamAvatarUrl = mockSteamData.avatarUrl;
    
    return mockSteamData;
  },

  // POST /api/integrations/steam/disconnect
  async disconnectSteam(): Promise<{ success: boolean }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update integration state
    mockIntegrationData.steamConnected = false;
    delete mockIntegrationData.steamUsername;
    delete mockIntegrationData.steamAvatarUrl;
    
    return { success: true };
  },

  // Similar methods for other integrations can be added here
  async connectDiscord(): Promise<{ success: boolean; username: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockDiscordData = {
      success: true,
      username: "DemoUser#1234",
    };
    
    mockIntegrationData.discordConnected = true;
    mockIntegrationData.discordUsername = mockDiscordData.username;
    
    return mockDiscordData;
  },

  async disconnectDiscord(): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    mockIntegrationData.discordConnected = false;
    delete mockIntegrationData.discordUsername;
    
    return { success: true };
  },
};
