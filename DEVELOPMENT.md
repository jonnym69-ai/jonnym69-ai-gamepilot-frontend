# GamePilot Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+ or pnpm

### Installation
```bash
npm install
# or
pnpm install
```

## 🛠️ Development Commands

### Standard Development (Concurrent)
```bash
# Start both web and API concurrently
npm run dev

# Start only web app (port 3002)
npm run dev:web-only

# Start only API (port 3001)
npm run dev:api-only
```

### Isolated Development (Recommended)
```bash
# Start both apps with port checking
npm run dev:isolated

# Start only web with isolation
npm run dev:web-iso

# Start only API with isolation
npm run dev:api-iso
```

## 📱 App Ports & URLs

| App | Port | URL | Description |
|-----|------|-----|-------------|
| GamePilot Web | 3002 | http://localhost:3002 | React frontend |
| GamePilot API | 3001 | http://localhost:3001 | Express backend |

## 🔧 Port Isolation Features

The isolated development script (`scripts/dev-isolated.js`) provides:

- **Port Conflict Detection**: Checks if ports are available before starting
- **Clean Logging**: Color-coded output for each app
- **Graceful Shutdown**: Proper cleanup on Ctrl+C
- **Error Handling**: Clear error messages for common issues

## 📁 Project Structure

```
gamepilot/
├── apps/
│   ├── web/          # React frontend (port 3002)
│   └── api/          # Express backend (port 3001)
├── packages/         # Shared packages
├── scripts/          # Development utilities
└── docs/            # Documentation
```

## 🌐 Environment Configuration

### Web App (.env.development)
- `VITE_PORT=3002`
- `VITE_API_URL=http://localhost:3001`

### API (.env.development)
- `PORT=3001`
- `CORS_ORIGIN=http://localhost:3002`

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3002  # macOS/Linux
netstat -ano | findstr :3002  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Clear Node Modules
```bash
# Clean all node_modules
npm run clean:all

# Clean specific app
npm run clean:web
npm run clean:api
```

### Reset Development Environment
```bash
# Stop all processes
pkill -f "node.*vite"
pkill -f "tsx.*watch"

# Clear ports and restart
npm run dev:isolated
```

## 🏗️ Build Commands

```bash
# Build all apps
npm run build

# Build specific app
npm run build:web
npm run build:api

# Preview builds
npm run preview:web
npm run preview:api
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Test specific app
npm run test:web
npm run test:api

# Watch mode
npm run test:watch
```

## 📝 Code Quality

```bash
# Lint all code
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

## 🔐 Environment Variables

### Required for API
- `JWT_SECRET`: JWT signing secret
- `STEAM_API_KEY`: Steam Web API key
- `DATABASE_URL`: SQLite database path

### Required for Web
- `VITE_STEAM_API_KEY`: Steam API key (client-side)

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker
```bash
docker-compose up -d
```

## 📚 Additional Resources

- [API Documentation](./API_DOCS.md)
- [Component Library](./packages/ui/README.md)
- [Shared Types](./packages/shared/README.md)
- [Deployment Guide](./DEPLOYMENT.md)

## 🐛 Bug Reports

For development issues:
1. Check port availability
2. Verify environment variables
3. Clear node_modules and reinstall
4. Use isolated development mode
5. Check console logs for specific errors

## 🤝 Contributing

1. Use isolated development mode
2. Follow the existing code style
3. Add tests for new features
4. Update documentation
5. Submit PR with clear description
