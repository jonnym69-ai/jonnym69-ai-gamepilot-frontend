import { PlatformCode } from '@gamepilot/types'
import type { Game } from '@gamepilot/types'

export interface RomFile {
  name: string
  path: string
  size: number
  extension: string
  platform: PlatformCode
  checksum?: string
}

export interface EmulatorConfig {
  platform: PlatformCode
  name: string
  executablePath?: string
  romExtensions: string[]
  supportedSystems: string[]
  defaultArgs?: string[]
}

export interface ScanResult {
  games: Game[]
  errors: string[]
  scannedFiles: number
  foundGames: number
}

// Platform to ROM extensions mapping
const PLATFORM_ROM_EXTENSIONS: Record<PlatformCode, string[]> = {
  [PlatformCode.RETROARCH]: ['.zip', '.7z', '.rar', '.nes', '.snes', '.gb', '.gbc', '.gba', '.nds', '.n64', '.psx', '.ps2', '.iso', '.bin', '.cue'],
  [PlatformCode.DOLPHIN]: ['.iso', '.gcz', '.gcm', '.wbfs', '.wad', '.rvz'],
  [PlatformCode.PROJECT64]: ['.z64', '.n64', '.v64', '.rom', '.zip'],
  [PlatformCode.PCSX2]: ['.iso', '.bin', '.img', '.mds', '.z'],
  [PlatformCode.RPCS3]: ['.iso', '.bin', '.img', '.ps3'],
  [PlatformCode.CEMU]: ['.wud', '.wux', '.iso', '.rpx'],
  [PlatformCode.YUZU]: ['.nsp', '.xci', '.nca'],
  [PlatformCode.RYUJINX]: ['.nsp', '.xci', '.nca'],
  [PlatformCode.MAME]: ['.zip', '.7z', '.chd', '.cue', '.bin'],
  [PlatformCode.DOSBOX]: ['.exe', '.com', '.bat', '.conf'],
  [PlatformCode.SCUMMVM]: ['.scummvm', '.exe', '.com'],
  [PlatformCode.VITA3K]: ['.vpk', '.zip'],
  [PlatformCode.XEMU]: ['.iso', '.xiso', '.cso', '.z'],
  [PlatformCode.MELONDS]: ['.nds', '.zip', '.7z'],
  [PlatformCode.PPSSPP]: ['.iso', '.cso', '.pbp', '.elf'],
  [PlatformCode.CITRA]: ['.3ds', '.3dsx', '.cia', '.cxi'],
  [PlatformCode.DESMUME]: ['.nds', '.zip'],
  // Default for other platforms
  [PlatformCode.STEAM]: [],
  [PlatformCode.XBOX]: [],
  [PlatformCode.PLAYSTATION]: [],
  [PlatformCode.NINTENDO]: [],
  [PlatformCode.EPIC]: [],
  [PlatformCode.GOG]: [],
  [PlatformCode.ORIGIN]: [],
  [PlatformCode.UPLAY]: [],
  [PlatformCode.BATTLENET]: [],
  [PlatformCode.DISCORD]: [],
  [PlatformCode.ITCH]: [],
  [PlatformCode.HUMBLE]: [],
  [PlatformCode.CUSTOM]: []
}

// Emulator configurations
export const EMULATOR_CONFIGS: EmulatorConfig[] = [
  {
    platform: PlatformCode.RETROARCH,
    name: 'RetroArch',
    romExtensions: PLATFORM_ROM_EXTENSIONS[PlatformCode.RETROARCH],
    supportedSystems: ['NES', 'SNES', 'GB', 'GBC', 'GBA', 'N64', 'PS1', 'Genesis', 'Arcade'],
    defaultArgs: ['--fullscreen']
  },
  {
    platform: PlatformCode.DOLPHIN,
    name: 'Dolphin',
    romExtensions: PLATFORM_ROM_EXTENSIONS[PlatformCode.DOLPHIN],
    supportedSystems: ['GameCube', 'Wii'],
    defaultArgs: ['-b', '-e']
  },
  {
    platform: PlatformCode.PROJECT64,
    name: 'Project64',
    romExtensions: PLATFORM_ROM_EXTENSIONS[PlatformCode.PROJECT64],
    supportedSystems: ['Nintendo 64'],
    defaultArgs: []
  },
  {
    platform: PlatformCode.PCSX2,
    name: 'PCSX2',
    romExtensions: PLATFORM_ROM_EXTENSIONS[PlatformCode.PCSX2],
    supportedSystems: ['PlayStation 2'],
    defaultArgs: ['--fullscreen']
  },
  {
    platform: PlatformCode.CEMU,
    name: 'Cemu',
    romExtensions: PLATFORM_ROM_EXTENSIONS[PlatformCode.CEMU],
    supportedSystems: ['Wii U'],
    defaultArgs: ['-f']
  },
  {
    platform: PlatformCode.YUZU,
    name: 'Yuzu',
    romExtensions: PLATFORM_ROM_EXTENSIONS[PlatformCode.YUZU],
    supportedSystems: ['Nintendo Switch'],
    defaultArgs: []
  },
  {
    platform: PlatformCode.RYUJINX,
    name: 'Ryujinx',
    romExtensions: PLATFORM_ROM_EXTENSIONS[PlatformCode.RYUJINX],
    supportedSystems: ['Nintendo Switch'],
    defaultArgs: []
  },
  {
    platform: PlatformCode.MAME,
    name: 'MAME',
    romExtensions: PLATFORM_ROM_EXTENSIONS[PlatformCode.MAME],
    supportedSystems: ['Arcade'],
    defaultArgs: []
  },
  {
    platform: PlatformCode.DOSBOX,
    name: 'DOSBox',
    romExtensions: PLATFORM_ROM_EXTENSIONS[PlatformCode.DOSBOX],
    supportedSystems: ['DOS'],
    defaultArgs: []
  },
  {
    platform: PlatformCode.SCUMMVM,
    name: 'ScummVM',
    romExtensions: PLATFORM_ROM_EXTENSIONS[PlatformCode.SCUMMVM],
    supportedSystems: ['Point & Click Adventure'],
    defaultArgs: ['--fullscreen']
  },
  {
    platform: PlatformCode.PPSSPP,
    name: 'PPSSPP',
    romExtensions: PLATFORM_ROM_EXTENSIONS[PlatformCode.PPSSPP],
    supportedSystems: ['PlayStation Portable'],
    defaultArgs: []
  },
  {
    platform: PlatformCode.CITRA,
    name: 'Citra',
    romExtensions: PLATFORM_ROM_EXTENSIONS[PlatformCode.CITRA],
    supportedSystems: ['Nintendo 3DS'],
    defaultArgs: []
  },
  {
    platform: PlatformCode.DESMUME,
    name: 'DeSmuME',
    romExtensions: PLATFORM_ROM_EXTENSIONS[PlatformCode.DESMUME],
    supportedSystems: ['Nintendo DS'],
    defaultArgs: []
  }
]

class EmulatorService {
  /**
   * Scan a directory for ROM files
   */
  async scanDirectory(directoryPath: string, platforms?: PlatformCode[]): Promise<ScanResult> {
    const result: ScanResult = {
      games: [],
      errors: [],
      scannedFiles: 0,
      foundGames: 0
    }

    try {
      // This would need to be implemented with Node.js fs/promises
      // For now, we'll simulate the scanning process
      const files = await this.getFilesInDirectory(directoryPath)
      result.scannedFiles = files.length

      const platformsToScan = platforms || Object.keys(PLATFORM_ROM_EXTENSIONS) as PlatformCode[]

      for (const file of files) {
        const extension = this.getFileExtension(file.name)
        const platform = this.detectPlatformForExtension(extension, platformsToScan)

        if (platform) {
          const game = await this.createGameFromRom(file, platform)
          result.games.push(game)
          result.foundGames++
        }
      }
    } catch (error) {
      result.errors.push(`Failed to scan directory: ${error}`)
    }

    return result
  }

  /**
   * Get files in directory (placeholder implementation)
   */
  private async getFilesInDirectory(_directoryPath: string): Promise<FileList> {
    // Placeholder implementation - in a real app, this would use Node.js fs or Electron APIs
    // For now, return empty FileList
    return new DataTransfer().files
  }

  /**
   * Get file extension
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.')
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex).toLowerCase() : ''
  }

  /**
   * Detect platform for file extension
   */
  private detectPlatformForExtension(extension: string, platforms: PlatformCode[]): PlatformCode | null {
    for (const platform of platforms) {
      const extensions = PLATFORM_ROM_EXTENSIONS[platform]
      if (extensions && extensions.includes(extension)) {
        return platform
      }
    }
    return null
  }

  /**
   * Create Game object from ROM file
   */
  private async createGameFromRom(romFile: File, platform: PlatformCode): Promise<Game> {
    const config = EMULATOR_CONFIGS.find(c => c.platform === platform)
    const nameWithoutExt = romFile.name.replace(/\.[^/.]+$/, '')
    
    // Try to extract game metadata from filename
    const metadata = this.extractGameMetadata(nameWithoutExt)

    const gameData = {
      id: `${platform}-${romFile.name}`,
      title: metadata.title || nameWithoutExt,
      description: metadata.description || `A ${config?.supportedSystems[0] || platform} game`,
      platforms: [{ 
        code: platform, 
        name: config?.name || platform,
        icon: `/platforms/${platform}.png`
      }],
      genres: metadata.genres || [],
      tags: metadata.tags || ['Retro', config?.supportedSystems[0] || 'Emulated'],
      coverImage: metadata.coverImage || '/assets/default-rom-cover.jpg',
      playStatus: 'unplayed' as const,
      isFavorite: false,
      addedAt: new Date(),
      hoursPlayed: 0,
      userRating: undefined,
      globalRating: undefined,
      releaseYear: metadata.releaseYear,
      subgenres: [],
      emotionalTags: []
    }

    // Add emulator-specific fields as unknown first
    const gameWithEmulator = {
      ...gameData,
      romPath: (romFile as any).path || '',
      emulatorConfig: config,
      fileSize: romFile.size
    } as unknown as Game

    return gameWithEmulator
  }

  /**
   * Extract metadata from ROM filename
   */
  private extractGameMetadata(filename: string): Partial<{
    title: string
    description: string
    genres: string[]
    tags: string[]
    coverImage: string
    releaseYear: number
  }> {
    // Simple filename parsing
    // Examples: "Super Mario World (USA).sfc", "The Legend of Zelda - Ocarina of Time.n64"
    
    // Remove region tags, version info, etc.
    const cleanName = filename
      .replace(/\((USA|EUR|JPN|World|NTSC|PAL)\)/gi, '')
      .replace(/\(Rev\s*[0-9]+\)/gi, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\.(v[0-9]+|Rev\s*[0-9]+|Beta|Alpha|Demo)/gi, '')
      .trim()

    // Extract potential year
    const yearMatch = cleanName.match(/\((19|20)\d{2}\)/)
    const releaseYear = yearMatch ? parseInt(yearMatch[0].slice(1, -1)) : undefined

    // Extract title (remove year and extra info)
    const title = cleanName.replace(/\(\d{4}\)/g, '').trim()

    return {
      title,
      releaseYear,
      tags: ['Retro', 'Emulated']
    }
  }

  /**
   * Get emulator configuration for platform
   */
  getEmulatorConfig(platform: PlatformCode): EmulatorConfig | undefined {
    return EMULATOR_CONFIGS.find(config => config.platform === platform)
  }

  /**
   * Get all supported emulator platforms
   */
  getSupportedPlatforms(): PlatformCode[] {
    return EMULATOR_CONFIGS.map(config => config.platform)
  }

  /**
   * Check if platform is an emulator
   */
  isEmulatorPlatform(platform: PlatformCode): boolean {
    return this.getSupportedPlatforms().includes(platform)
  }
}

export const emulatorService = new EmulatorService()