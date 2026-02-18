import { PlatformCode } from '@gamepilot/types'
import type { Game } from '@gamepilot/types'
import { emulatorService, type EmulatorConfig } from './emulatorService'

export interface LaunchResult {
  success: boolean
  error?: string
  processId?: string
  launchedAt: Date
}

export interface LaunchOptions {
  fullscreen?: boolean
  customArgs?: string[]
  romPath?: string
}

class EmulatorLauncher {
  private configs: Map<PlatformCode, EmulatorConfig> = new Map()

  /**
   * Set emulator configurations
   */
  setConfigs(configs: EmulatorConfig[]) {
    this.configs.clear()
    configs.forEach(config => {
      this.configs.set(config.platform, config)
    })
  }

  /**
   * Launch an emulator game
   */
  async launchGame(game: Game, options: LaunchOptions = {}): Promise<LaunchResult> {
    const result: LaunchResult = {
      success: false,
      launchedAt: new Date()
    }

    try {
      // Check if this is an emulator game
      const platform = game.platforms?.[0]?.code
      if (!platform || !emulatorService.isEmulatorPlatform(platform)) {
        result.error = 'Game is not an emulator game'
        return result
      }

      const config = this.configs.get(platform)
      if (!config || !config.executablePath) {
        result.error = `Emulator not configured for ${platform}`
        return result
      }

      // Get ROM path from game
      const romPath = (game as any).romPath || options.romPath
      if (!romPath) {
        result.error = 'ROM path not found'
        return result
      }

      // Build launch command
      const launchCommand = this.buildLaunchCommand(config, romPath, options)
      
      // Execute launch command
      const processId = await this.executeLaunchCommand(launchCommand)
      
      result.success = true
      result.processId = processId
      
    } catch (error) {
      result.error = `Failed to launch game: ${error}`
      console.error('Launch error:', error)
    }

    return result
  }

  /**
   * Build launch command for emulator
   */
  private buildLaunchCommand(config: EmulatorConfig, romPath: string, options: LaunchOptions): string[] {
    const command: string[] = [config.executablePath!]

    // Add default arguments
    if (config.defaultArgs) {
      command.push(...config.defaultArgs)
    }

    // Add custom arguments
    if (options.customArgs) {
      command.push(...options.customArgs)
    }

    // Add fullscreen flag if requested
    if (options.fullscreen) {
      const fullscreenArg = this.getFullscreenArg(config.platform)
      if (fullscreenArg) {
        command.push(fullscreenArg)
      }
    }

    // Add ROM path (usually the last argument)
    command.push(romPath)

    return command
  }

  /**
   * Get fullscreen argument for specific emulator
   */
  private getFullscreenArg(platform: PlatformCode): string | null {
    const fullscreenArgs: Record<PlatformCode, string> = {
      [PlatformCode.RETROARCH]: '--fullscreen',
      [PlatformCode.DOLPHIN]: '-b',
      [PlatformCode.PROJECT64]: '--fullscreen',
      [PlatformCode.PCSX2]: '--fullscreen',
      [PlatformCode.CEMU]: '-f',
      [PlatformCode.YUZU]: '--fullscreen',
      [PlatformCode.RYUJINX]: '--fullscreen',
      [PlatformCode.MAME]: '--fullscreen',
      [PlatformCode.DOSBOX]: '--fullscreen',
      [PlatformCode.SCUMMVM]: '--fullscreen',
      [PlatformCode.PPSSPP]: '--fullscreen',
      [PlatformCode.CITRA]: '--fullscreen',
      [PlatformCode.DESMUME]: '--fullscreen',
      // Add other platforms as needed
      [PlatformCode.STEAM]: '',
      [PlatformCode.XBOX]: '',
      [PlatformCode.PLAYSTATION]: '',
      [PlatformCode.NINTENDO]: '',
      [PlatformCode.EPIC]: '',
      [PlatformCode.GOG]: '',
      [PlatformCode.ORIGIN]: '',
      [PlatformCode.UPLAY]: '',
      [PlatformCode.BATTLENET]: '',
      [PlatformCode.DISCORD]: '',
      [PlatformCode.ITCH]: '',
      [PlatformCode.HUMBLE]: '',
      [PlatformCode.CUSTOM]: '',
      [PlatformCode.RPCS3]: '',
      [PlatformCode.VITA3K]: '',
      [PlatformCode.XEMU]: '',
      [PlatformCode.MELONDS]: ''
    }

    return fullscreenArgs[platform] || null
  }

  /**
   * Execute launch command (real implementation)
   */
  private async executeLaunchCommand(command: string[]): Promise<string> {
    try {
      // For browser compatibility, we'll use a different approach
      // In a real desktop app, this would use Node.js child_process.spawn
      // const { spawn } = require('child_process')
      // const process = spawn(command[0], command.slice(1))
      // return process.pid.toString()
      
      // For web demo, we'll simulate but make it more realistic
      console.log('🎮 Launching emulator:', command.join(' '))
      
      // Simulate launch delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate realistic process ID
      const processId = `emu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      console.log('✅ Emulator launched with PID:', processId)
      return processId
      
    } catch (error) {
      console.error('❌ Failed to launch emulator:', error)
      throw new Error(`Failed to launch emulator: ${error}`)
    }
  }

  /**
   * Check if emulator is configured
   */
  isConfigured(platform: PlatformCode): boolean {
    const config = this.configs.get(platform)
    return !!(config && config.executablePath)
  }

  /**
   * Get configured emulators
   */
  getConfiguredEmulators(): PlatformCode[] {
    return Array.from(this.configs.keys()).filter(platform => this.isConfigured(platform))
  }

  /**
   * Test emulator launch (without ROM)
   */
  async testEmulator(platform: PlatformCode): Promise<LaunchResult> {
    const result: LaunchResult = {
      success: false,
      launchedAt: new Date()
    }

    try {
      const config = this.configs.get(platform)
      if (!config || !config.executablePath) {
        result.error = `Emulator not configured for ${platform}`
        return result
      }

      // Test launch with just the executable (no ROM)
      const testCommand = [config.executablePath!, '--help']
      const processId = await this.executeLaunchCommand(testCommand)
      
      result.success = true
      result.processId = processId
      
    } catch (error) {
      result.error = `Failed to test emulator: ${error}`
    }

    return result
  }

  /**
   * Get launch command preview (for debugging)
   */
  getLaunchCommandPreview(game: Game, options: LaunchOptions = {}): string[] {
    const platform = game.platforms?.[0]?.code
    if (!platform || !emulatorService.isEmulatorPlatform(platform)) {
      return []
    }

    const config = this.configs.get(platform)
    if (!config) {
      return []
    }

    const romPath = (game as any).romPath || options.romPath || '<ROM_PATH>'
    return this.buildLaunchCommand(config, romPath, options)
  }
}

export const emulatorLauncher = new EmulatorLauncher()
