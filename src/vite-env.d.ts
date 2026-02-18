/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_STEAM_API_KEY?: string
  readonly VITE_YOUTUBE_API_KEY?: string
  readonly VITE_DISCORD_BOT_TOKEN?: string
  readonly VITE_DISCORD_USER_TOKEN?: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
