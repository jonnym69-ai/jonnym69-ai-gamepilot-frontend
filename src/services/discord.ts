export interface DiscordServer {
  id: string
  name: string
  description: string
  icon: string
  members: {
    online: number
    total: number
  }
  channels: {
    text: number
    voice: number
  }
  boosted: boolean
  verified: boolean
  inviteCode?: string
  vanityUrl?: string
}

export interface DiscordWidgetResponse {
  server: DiscordServer
  instantInviteUrl: string
  presence: {
    online: number
    total: number
  }
}

export interface DiscordServerInfo {
  id: string
  name: string
  iconUrl: string
  membersOnline: number
  membersTotal: number
  instantInviteUrl?: string
  presence: string
}

/**
 * Fetch basic Discord server info using the public widget API
 * Uses Discord's widget endpoint which doesn't require authentication
 */
export async function fetchDiscordServerInfo(
  serverId: string
): Promise<DiscordWidgetResponse> {
  try {
    // For demo purposes, we'll simulate the API response
    // In production, replace with actual API call:
    // const widgetUrl = `https://discord.com/api/guilds/${serverId}/widget.json`
    // const response = await fetch(widgetUrl)
    // if (!response.ok) {
    //   throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    // }
    // const data = await response.json()
    
    // Mock response for demonstration
    const mockServerInfo: DiscordWidgetResponse = {
      server: {
        id: serverId,
        name: 'GamePilot Community',
        description: 'Join our gaming community! Share your experiences, find teammates, and stay updated on the latest gaming news.',
        icon: `https://cdn.discordapp.com/icons/${serverId}/a_1234567890abcdef1234567890.png`,
        members: {
          online: 127,
          total: 1856
        },
        channels: {
          text: 24,
          voice: 8
        },
        boosted: true,
        verified: true,
        inviteCode: 'gamepilot',
        vanityUrl: 'gamepilot'
      },
      instantInviteUrl: `https://discord.gg/${serverId === '123456789012345678' ? 'gamepilot' : serverId}`,
      presence: {
        online: 127,
        total: 1856
      }
    }

    return mockServerInfo

  } catch (error) {
    console.error('Error fetching Discord server info:', error)
    throw new Error(`Failed to fetch Discord server info: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate Discord invite URL
 */
export function generateInviteUrl(_serverId: string, inviteCode?: string): string {
  if (inviteCode) {
    return `https://discord.gg/${inviteCode}`
  }
  return `https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot&response_type=code`
}

/**
 * Format member count for display
 */
export function formatMemberCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K members`
  } else {
    return `${count} members`
  }
}

/**
 * Get server status based on online members
 */
export function getServerStatus(onlineMembers: number, totalMembers: number): {
  status: 'active' | 'moderate' | 'quiet'
  percentage: number
  color: string
} {
  const percentage = (onlineMembers / totalMembers) * 100
  
  let status: 'active' | 'moderate' | 'quiet'
  let color: string
  
  if (percentage >= 50) {
    status = 'active'
    color = 'text-green-400'
  } else if (percentage >= 20) {
    status = 'moderate'
    color = 'text-yellow-400'
  } else {
    status = 'quiet'
    color = 'text-gray-400'
  }
  
  return {
    status,
    percentage,
    color
  }
}

/**
 * Fetch multiple Discord servers info
 */
export async function fetchMultipleServers(
  serverIds: string[]
): Promise<DiscordWidgetResponse[]> {
  try {
    const promises = serverIds.map(serverId => fetchDiscordServerInfo(serverId))
    const results = await Promise.all(promises)
    return results
  } catch (error) {
    console.error('Error fetching multiple Discord servers:', error)
    throw new Error(`Failed to fetch Discord servers: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Validate Discord server ID format
 */
export function isValidServerId(serverId: string): boolean {
  // Discord server IDs are typically 17-19 digit snowflake IDs
  const snowflakeRegex = /^\d{17,19}$/
  return snowflakeRegex.test(serverId)
}

/**
 * Get server icon URL in different sizes
 */
export function getServerIconUrl(
  serverId: string, 
  iconHash?: string, 
  size: 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 4096 = 128
): string {
  if (!iconHash) {
    return `https://cdn.discordapp.com/embed/avatars/${serverId}.png`
  }
  
  return `https://cdn.discordapp.com/icons/${serverId}/${iconHash}.png?size=${size}`
}
