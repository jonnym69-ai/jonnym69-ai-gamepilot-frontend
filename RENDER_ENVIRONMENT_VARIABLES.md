# 🌐 Render Environment Variables

## Required Variables for GamePilot API

Copy these into your Render dashboard:

```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-change-this-in-production
SESSION_SECRET=your-session-secret-change-in-production
```

## Optional Variables

```bash
# External API Keys (if you have them)
STEAM_API_KEY=your-steam-api-key
DISCORD_BOT_TOKEN=your-discord-bot-token
YOUTUBE_API_KEY=your-youtube-api-key

# Database (Render PostgreSQL - if you upgrade)
DATABASE_URL=your-render-postgres-url
```

## CORS Settings

After deployment, add your Vercel URL:
```bash
ALLOWED_ORIGINS=https://your-app-name.vercel.app
```

## Important Notes

1. **JWT_SECRET**: Use a strong, random string (32+ characters)
2. **SESSION_SECRET**: Use another strong, random string
3. **PORT**: Keep as 3001 (Render will handle port mapping)
4. **NODE_ENV**: Must be "production"

## Secret Generator

Use this for secrets:
```bash
# Generate strong secrets
openssl rand -base64 32
```

## After Setup

1. Deploy the service
2. Copy the Render URL
3. Use it in Vercel environment variables
