/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YOUTUBE_API_KEY: string
  readonly VITE_DISCORD_BOT_TOKEN: string
  readonly VITE_DISCORD_USER_TOKEN: string
  readonly VITE_STEAM_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
