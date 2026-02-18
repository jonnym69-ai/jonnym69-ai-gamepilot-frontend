// Game utility functions for GamePilot platform
import { PlatformCode } from '../types'

export const getPlatformColor = (platformCode: PlatformCode): string => {
  const colors: Record<PlatformCode, string> = {
    [PlatformCode.STEAM]: '#1B2838',
    [PlatformCode.XBOX]: '#107C10',
    [PlatformCode.PLAYSTATION]: '#003791',
    [PlatformCode.NINTENDO]: '#E60012',
    [PlatformCode.EPIC]: '#313131',
    [PlatformCode.GOG]: '#8B46FF',
    [PlatformCode.ORIGIN]: '#F56B00',
    [PlatformCode.UPLAY]: '#00B4D3',
    [PlatformCode.BATTLENET]: '#1A5CAD',
    [PlatformCode.DISCORD]: '#5865F2',
    [PlatformCode.ITCH]: '#FA5C5C',
    [PlatformCode.HUMBLE]: '#CB772D',
    [PlatformCode.YOUTUBE]: '#FF0000',
    [PlatformCode.CUSTOM]: '#6B7280'
  }
  return colors[platformCode] || colors[PlatformCode.CUSTOM]
}

export const getPlatformName = (platformCode: PlatformCode): string => {
  const names: Record<PlatformCode, string> = {
    [PlatformCode.STEAM]: 'Steam',
    [PlatformCode.XBOX]: 'Xbox',
    [PlatformCode.PLAYSTATION]: 'PlayStation',
    [PlatformCode.NINTENDO]: 'Nintendo',
    [PlatformCode.EPIC]: 'Epic Games',
    [PlatformCode.GOG]: 'GOG',
    [PlatformCode.ORIGIN]: 'Origin',
    [PlatformCode.UPLAY]: 'Ubisoft Connect',
    [PlatformCode.BATTLENET]: 'Battle.net',
    [PlatformCode.DISCORD]: 'Discord',
    [PlatformCode.ITCH]: 'Itch.io',
    [PlatformCode.HUMBLE]: 'Humble Bundle',
    [PlatformCode.YOUTUBE]: 'YouTube',
    [PlatformCode.CUSTOM]: 'Other'
  }
  return names[platformCode] || names[PlatformCode.CUSTOM]
}
