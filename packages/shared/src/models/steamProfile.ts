export interface SteamProfile {
  steamId: string
  personaName: string
  profileUrl: string
  avatar: string
  avatarMedium?: string
  avatarFull?: string
  personaState?: number
  personaStateFlags?: number
  gameServerIp?: string
  gameServerPort?: number
  gameExtraInfo?: string
  gameId?: string
}
