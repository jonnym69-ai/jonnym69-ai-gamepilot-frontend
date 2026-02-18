import { PlatformCode } from '../types'

export const PLATFORM_LIST: PlatformCode[] = [
  PlatformCode.STEAM,
  PlatformCode.EPIC,
  PlatformCode.XBOX,
  PlatformCode.PLAYSTATION,
  PlatformCode.NINTENDO,
  PlatformCode.GOG,
  PlatformCode.ORIGIN,
  PlatformCode.UPLAY,
  PlatformCode.BATTLENET,
  PlatformCode.DISCORD,
  PlatformCode.ITCH,
  PlatformCode.HUMBLE,
  PlatformCode.YOUTUBE,
  PlatformCode.CUSTOM
]

export const isValidPlatformCode = (code: string): code is PlatformCode => {
  return PLATFORM_LIST.includes(code as PlatformCode)
}

export const getPlatformName = (code: PlatformCode): string => {
  const platformNames: Record<PlatformCode, string> = {
    [PlatformCode.STEAM]: 'Steam',
    [PlatformCode.EPIC]: 'Epic Games',
    [PlatformCode.XBOX]: 'Xbox',
    [PlatformCode.PLAYSTATION]: 'PlayStation',
    [PlatformCode.NINTENDO]: 'Nintendo',
    [PlatformCode.GOG]: 'GOG',
    [PlatformCode.ORIGIN]: 'Origin',
    [PlatformCode.UPLAY]: 'Ubisoft Connect',
    [PlatformCode.BATTLENET]: 'Battle.net',
    [PlatformCode.DISCORD]: 'Discord',
    [PlatformCode.ITCH]: 'itch.io',
    [PlatformCode.HUMBLE]: 'Humble Bundle',
    [PlatformCode.YOUTUBE]: 'YouTube',
    [PlatformCode.CUSTOM]: 'Custom'
  }

  return platformNames[code] || 'Unknown Platform'
}

export const getPlatformCode = (platform: string): PlatformCode => {
  const codeMap: Record<string, PlatformCode> = {
    'steam': PlatformCode.STEAM,
    'epic': PlatformCode.EPIC,
    'xbox': PlatformCode.XBOX,
    'playstation': PlatformCode.PLAYSTATION,
    'nintendo': PlatformCode.NINTENDO,
    'gog': PlatformCode.GOG,
    'origin': PlatformCode.ORIGIN,
    'uplay': PlatformCode.UPLAY,
    'battlenet': PlatformCode.BATTLENET,
    'discord': PlatformCode.DISCORD,
    'itch': PlatformCode.ITCH,
    'humble': PlatformCode.HUMBLE,
    'youtube': PlatformCode.YOUTUBE,
    'custom': PlatformCode.CUSTOM
  }

  return codeMap[platform.toLowerCase()] || PlatformCode.CUSTOM
}
