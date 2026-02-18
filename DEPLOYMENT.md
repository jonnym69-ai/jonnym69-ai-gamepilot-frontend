# GamePilot Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/gamepilot.git
cd gamepilot

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Configuration
```bash
# .env.local
# YouTube API (optional)
VITE_YOUTUBE_API_KEY=your_youtube_api_key

# Discord Bot Token (optional)
VITE_DISCORD_BOT_TOKEN=your_discord_bot_token

# Discord User Token (optional)
VITE_DISCORD_USER_TOKEN=your_discord_user_token

# Steam API Key (optional)
VITE_STEAM_API_KEY=your_steam_api_key

# Development/Production
NODE_ENV=development
```

## 🛠️ Development

### Start Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## 🏗️ Build Process

### Development Build
```bash
npm run build
```

### Production Build
```bash
npm run build:prod
```

The build artifacts will be in the `dist/` directory.

## 📦 Deployment Options

### 1. Static Hosting (Recommended)

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Build
npm run build

# Deploy to Netlify
npx netlify deploy --prod --dir=dist
```

#### GitHub Pages
```bash
# Build
npm run build

# Deploy to gh-pages
npx gh-pages -d dist
```

### 2. Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  gamepilot:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
```

### 3. Cloud Platform Deployment

#### AWS S3 + CloudFront
```bash
# Build and upload to S3
npm run build
aws s3 sync dist/ s3://your-bucket --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

#### Google Cloud Platform
```bash
# Build
npm run build

# Deploy to App Engine
gcloud app deploy dist --project=your-project-id
```

## 🔧 Configuration

### Vite Configuration
The `vite.config.ts` is optimized for production:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@gamepilot/static-data': resolve(__dirname, 'packages/static-data/src'),
      '@gamepilot/identity-engine': resolve(__dirname, 'packages/identity-engine/src'),
      '@gamepilot/ui': resolve(__dirname, 'packages/ui/src'),
      '@gamepilot/integrations': resolve(__dirname, 'packages/integrations/src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@gamepilot/ui'],
          integrations: ['@gamepilot/integrations']
        }
      }
    },
    server: {
      port: 5173,
      host: true
    }
})
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:prod": "NODE_ENV=production npm run build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "clean": "rimraf dist",
    "deploy:vercel": "vercel --prod",
    "deploy:netlify": "npm run build && npx netlify deploy --prod --dir=dist",
    "docker:build": "docker build -t gamepilot .",
    "docker:run": "docker run -p 80:80 gamepilot"
  }
}
```

## 🔒 Security Considerations

### Environment Variables
- Never commit API keys to version control
- Use environment-specific configurations
- Implement rate limiting for API endpoints
- Validate all user inputs

### HTTPS Configuration
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.steampowered.com https://www.googleapis.com;">
```

## 📊 Monitoring & Analytics

### Performance Monitoring
```javascript
// Add to main.tsx
import { performance } from './utils/performance'

// Track Core Web Vitals
performance.measure('app-load', () => {
  // Application load time
})

performance.measure('first-contentful-paint', () => {
  // First meaningful paint
})
```

### Error Tracking
```javascript
// Error boundary component
import { reportError } from './utils/errorReporting'

export function ErrorBoundary({ error, resetErrorBoundary }) {
  React.useEffect(() => {
    reportError(error)
  }, [error, resetErrorBoundary])
}
```

### Health Checks
```javascript
// health-check.js
export async function healthCheck() {
  const checks = await Promise.all([
    checkIntegrations(),
    checkDatabase(),
    checkAPIs()
  ])
  
  return {
    status: checks.every(check => check.healthy) ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString()
  }
}
```

## 🚀 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy GamePilot

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:prod
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      - name: Deploy to Vercel
        run: |
          npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 📱 Mobile Optimization

### Progressive Web App
```javascript
// public/manifest.json
{
  "name": "GamePilot",
  "short_name": "GamePilot",
  "description": "Your Gaming Identity Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#8B5CF6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### Service Worker
```javascript
// public/sw.js
const CACHE_NAME = 'gamepilot-v1'
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})
```

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache
npm run clean
rm -rf node_modules
npm install

# Check TypeScript version
npx tsc --version

# Verify environment variables
printenv | grep VITE_
```

#### Integration Issues
```bash
# Test API connections
curl -H "Authorization: Bearer $API_KEY" https://api.example.com/health

# Check rate limits
npm run api:limits

# Verify environment
npm run env:check
```

#### Performance Issues
```bash
# Analyze bundle size
npm run build:analyze

# Check memory usage
npm run memory:profile

# Monitor network requests
npm run network:monitor
```

## 📚 Additional Resources

### Documentation
- [API Documentation](./docs/api/)
- [Component Library](./docs/components/)
- [Integration Guides](./docs/integrations/)
- [Troubleshooting Guide](./docs/troubleshooting/)

### Support
- [GitHub Issues](https://github.com/your-org/gamepilot/issues)
- [Discord Community](https://discord.gg/gamepilot)
- [Documentation](https://docs.gamepilot.dev)

---

**GamePilot** - Ready for production deployment! 🚀
