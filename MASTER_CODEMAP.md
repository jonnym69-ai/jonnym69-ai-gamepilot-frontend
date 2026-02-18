# GamePilot Master CodeMap

## 🏗️ Project Architecture Overview

GamePilot is a comprehensive gaming identity platform built as a monorepo using npm workspaces. The platform integrates multiple gaming services to provide personalized game recommendations, mood-based gaming experiences, and community engagement features.

## 📁 Monorepo Structure

```text
gamepilot/
├── apps/                    # Application layer
│   ├── web/                # React 18 + Vite frontend
│   └── api/                # Node.js + Express backend
├── packages/               # Shared packages
│   ├── config/             # Build configurations
│   ├── identity-engine/    # Mood/playstyle models
│   ├── integrations/       # Platform integrations
│   ├── shared/             # Core types and utilities
│   ├── static-data/        # Gaming data constants
│   ├── types/              # TypeScript type definitions
│   └── ui/                 # Cinematic UI components
├── docs/                   # Documentation
└── .devcontainer/         # Development environment
```

### Workspace Configuration

**Root package.json**:

- **Workspaces**: `apps/*`, `packages/*`
- **Scripts**: Development, building, testing, linting
- **Node Version**: >=18.0.0
- **Package Manager**: npm >=9.0.0

**Development Commands**:

```bash
npm run dev          # Start both web and api
npm run dev:web      # Frontend only
npm run dev:api      # Backend only
npm run build        # Build all packages
npm run test         # Run all tests
npm run lint         # Lint all packages
```

## 🚀 Applications

### apps/web - Frontend Application

**Technology Stack**: React 18, Vite, TypeScript, TailwindCSS, Zustand

#### Core Structure

```text
apps/web/src/
├── components/             # Reusable UI components
├── features/              # Feature-based modules
│   ├── home/              # Home dashboard
│   ├── library/           # Game library management
│   ├── identity/          # User identity & profiles
│   ├── recommendations/   # Game recommendations
│   └── integrations/       # Platform connections
├── pages/                 # Route-level components
├── services/              # External API integrations
├── stores/                # Zustand state management
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
└── types/                 # Local type definitions
```

#### Key Features

- **HomeHub**: Dynamic dashboard with mood-based backgrounds
- **Library System**: Game management with platform support
- **Identity Engine**: Mood and playstyle analysis
- **Integration Manager**: Unified platform connections

### apps/api - Backend API

**Technology Stack**: Node.js, Express, SQLite, JWT, Zod

#### API Structure

```text
apps/api/src/
├── routes/                # API route handlers
├── steam/                 # Steam integration endpoints
├── index.ts              # Application entry point
└── router.ts             # Route configuration
```

## 📦 Shared Packages

### packages/shared - Core Infrastructure

**Structure**:

```text
packages/shared/src/
├── constants/             # Application-wide constants
├── models/               # Data models and interfaces
├── schemas/              # Zod validation schemas
├── types/                # TypeScript type definitions
├── utils/                # Shared utility functions
└── index.ts              # Package exports
```

**Purpose**:

- **Types**: Common interfaces and models
- **Schemas**: Zod validation schemas
- **Constants**: Application-wide constants
- **Utilities**: Shared helper functions

### packages/ui - Component Library

**Structure**:

```text
packages/ui/src/
├── components/             # UI component library
│   ├── ActivityPulse.tsx    # Activity feed component
│   ├── Button.tsx           # Reusable button component
│   ├── Card.tsx             # Glass-morphism card
│   ├── GameTile.tsx         # Game display tile
│   ├── Input.tsx            # Form input component
│   ├── MoodBar.tsx         # Mood selection bar
│   ├── Panel.tsx            # Glass panel component
│   ├── Spotlight.tsx         # Content spotlight
│   └── layout/              # Layout components
├── styles/                # Design system styles
│   ├── colors.ts            # Color system and themes
│   ├── motion.ts           # Animations and transitions
│   └── typography.ts       # Typography system
├── utils/                 # Utility functions
│   └── cn.ts              # Class name utility
└── index.ts              # Package exports
```

**Key Components**:

- **ActivityPulse**: Real-time activity feed
- **Button**: Themed button with variants
- **Card**: Glass-morphism card component
- **GameTile**: Game display with platform icons
- **Input**: Form inputs with validation
- **MoodBar**: Mood selection interface
- **Panel**: Glass panel for content sections
- **Spotlight**: Featured content display

**Design System**:

- **Colors**: Gaming-themed color palette
- **Typography**: Gaming-inspired text styles
- **Motion**: Smooth animations and transitions
- **Glass-morphism**: Cinematic UI effects

**Purpose**:

- **Design System**: Glass-morphism cinematic UI
- **Components**: Reusable UI components
- **Themes**: Dynamic styling and theming
- **Icons**: Custom icon sets

### packages/integrations - Platform Services

**Structure**:

```text
packages/integrations/src/
├── discord.ts            # Discord API integration
├── steam.ts              # Steam Web API integration
├── youtube.ts            # YouTube Data API integration
└── index.ts              # Integration manager
```

**Purpose**:

- **YouTube**: Gaming content and trending videos
- **Discord**: Guild info and community data
- **Steam**: Game library and player profiles
- **Integration Manager**: Unified service orchestration

### packages/identity-engine - Personalization Core

**Structure**:

```text
packages/identity-engine/src/
├── types.ts              # Identity engine type definitions
├── moodModel.ts           # Mood computation algorithms
├── playstyleModel.ts       # Playstyle analysis
├── recommendations.ts      # Game recommendation engine
├── computeIdentity.ts     # Main identity computation
└── index.ts              # Package exports
```

**Key Types**:

- `UserMood`: User mood preferences and frequency
- `PlaystyleIndicator`: 8 playstyle archetypes
- `UserPlaystyle`: Primary/secondary playstyles with preferences
- `GameSession`: Individual gaming sessions with mood data
- `PlayerIdentity`: Complete player profile with computed identity
- `RecommendationContext`: Context for game recommendations
- `GameRecommendation`: Scored game suggestions

**Purpose**:

- **MoodProfile**: Heuristic mood computation
- **GenreProfile**: Genre affinity analysis
- **PersonalityProfile**: 8 playstyle archetypes
- **RecommendationEngine**: Rule-based game suggestions

### packages/static-data - Gaming Data

**Structure**:

```text
packages/static-data/src/
├── genres.ts              # Gaming genre definitions
├── moods.ts               # Mood definitions with intensities
├── tags.ts                # Game metadata tags
└── index.ts              # Package exports
```

**Key Data**:

- **GENRES**: Complete gaming genre taxonomy
- **MOODS**: Mood definitions with intensity levels
- **TAGS**: Comprehensive game tagging system

**Purpose**:

- **Genres**: Gaming genre definitions
- **Moods**: Emotional state categories
- **Tags**: Game metadata tags
- **Constants**: Static gaming data

### packages/types - TypeScript Definitions

**Structure**:

```text
packages/types/src/
├── index.ts               # Main type exports
└── platforms.ts           # Platform code definitions
```

**Key Exports**:

- `PlatformCode`: Enum for all gaming platforms
- `Game`: Complete game interface
- `Platform`: Platform connection interface
- `Achievement`: Achievement system interface
- `UserPreferences`: User settings and preferences

**Purpose**:

- **Core Types**: Essential interfaces
- **API Types**: Request/response models
- **Integration Types**: Platform-specific types
- **UI Types**: Component prop types

### packages/config - Build Configuration

**Purpose**:

- **Workspace Config**: npm workspace settings
- **Build Scripts**: Shared build utilities
- **Development Config**: Environment setups

## 🔄 Data Flow Architecture

### Frontend Data Flow

1. **User Interaction** → Components/Features
2. **State Management** → Zustand stores
3. **Service Layer** → API calls and integrations
4. **Data Processing** → Identity engine computations
5. **UI Updates** → Reactive component re-renders

### Backend Data Flow

1. **API Requests** → Route handlers
2. **Validation** → Zod schemas
3. **Business Logic** → Service layer
4. **Data Persistence** → SQLite database
5. **External APIs** → Platform integrations

### Integration Data Flow

1. **Platform APIs** → Integration packages
2. **Data Normalization** → Shared types
3. **Identity Processing** → Identity engine
4. **Recommendation Generation** → Recommendation engine
5. **Personalization** → Mood-based content

## 🎯 Key Architectural Patterns

### Monorepo Management

- **npm Workspaces**: Shared dependency management
- **TypeScript Project References**: Cross-package type checking
- **Shared Build Pipeline**: Consistent build processes

### State Management

- **Zustand**: Lightweight state management
- **Feature-based Stores**: Modular state organization
- **Reactive Updates**: Efficient re-rendering

### Integration Architecture

- **Adapter Pattern**: Platform-specific adapters
- **Service Registry**: Centralized integration management
- **Error Boundaries**: Graceful failure handling

### UI Architecture

- **Component Composition**: Reusable component patterns
- **Theme System**: Dynamic theming capabilities
- **Responsive Design**: Multi-device support

## 🔧 Development Workflow

### Package Dependencies

```text
apps/web → packages/ui, shared, types, identity-engine
apps/api → packages/shared, types, integrations
packages/ui → packages/types, shared
packages/integrations → packages/types, shared
packages/identity-engine → packages/types, static-data
```

### Build Process

1. **Package Building**: Shared packages built first
2. **Application Building**: Apps depend on packages
3. **Type Checking**: Cross-package type validation
4. **Bundle Optimization**: Production-ready builds

### Development Server

- **Frontend**: Vite dev server with HMR
- **Backend**: Express server with auto-reload
- **Package Development**: Watch mode for packages

## 🚦 Current Status

### ✅ Completed Features

- **Monorepo structure setup** - Complete with npm workspaces
- **Basic UI component library** - 20+ cinematic components with glass-morphism
- **Integration packages** - YouTube, Discord, Steam platform integrations
- **Identity engine core algorithms** - Mood/playstyle models and recommendations
- **Frontend application structure** - React 18 + Vite with Zustand state management
- **Backend API foundation** - Node.js + Express with SQLite
- **🆕 STEP 11: Model Deprecation & Consolidation** - Complete canonical model architecture
- **🆕 Canonical User/UserIntegration Models** - Unified type system across monorepo
- **🆕 Game Interface Alignment** - All components using canonical Game interface
- **🆕 Build Infrastructure Optimization** - 73% error reduction achieved

### 🔄 In Progress

- Frontend-backend integration (90% complete)
- Real data connections (replacing mock data)
- Authentication system refinement
- Production deployment configuration

### 🎯 Next Phases

#### Phase 2.0 – Stability & UX Polish (Week 2-3) - **ENHANCED**
**NEW**: Enhanced Game Details Page & Emulator Support

**Required Tasks**:
1. **Enhanced Game Details Page** (Week 1)
   - Hero Section: Cinematic header with cover art, blurred background, launch button
   - Identity + Mood Layer: Mood tags, emotional profile, "what this game says about you"
   - Stats + History: Playtime, last played, sessions timeline, achievements
   - Shelves Algorithm: "From This Era", "Similar Vibes", "Games You Played Around This Time"
   - Metadata: Description, genres, release year, developer, publisher, platforms
   - Media: Screenshots, trailer, background art
   - Actions: Add tags, add to shelf, mark as completed, rate mood, edit metadata

2. **Emulator Support Integration** (Week 1-2)
   - Extend PlatformCode enum for emulators (RetroArch, Dolphin, etc.)
   - Add file path scanning for ROM directories
   - Modular integration without breaking existing platforms
   - Launch capabilities for emulated games

3. **Shelves Algorithm Implementation** (Week 2)
   - Era-based game grouping and recommendations
   - Mood similarity matching across library
   - Temporal relationship analysis ("Games You Played Around This Time")
   - Cross-era discovery ("Games You Haven't Played in This Era")

4. **Media Integration & Polish** (Week 3)
   - Screenshot gallery with cinematic viewer
   - Trailer integration (YouTube/Vimeo)
   - Background art with blur effects
   - Launch button integration with platform detection

**Dependencies**:
- Phase 1.9 completion (legacy model cleanup)
- UI component library (glass-morphism design system)
- Identity engine integration (mood computation)

**Estimated Effort**: 3 weeks (perfect fit for Phase 2.0)
**Success Criteria**:
- ✅ Cinematic game details experience matching vision
- ✅ Functional emulator support with modular design
- ✅ Intelligent shelf algorithms working
- ✅ Complete game management (CRUD + launch)

#### Phase 2.5 – Feature Completeness (Week 4-5)
- Complete game management with advanced features
- Real mood-based filtering and recommendations
- Advanced library features and search
- Performance optimization for large libraries

#### Phase 3.0 – Early Access v1.0 (Week 6)
- Testing & quality assurance
- Production deployment
- UI polish & onboarding
- Launch preparation

#### Phase 4.0 – Post-Launch Evolution (Months 2-6)
- Community integrations (YouTube, Twitch, Discord)
- Personalization & AI enhancements
- Social features and platform expansion
- Mobile applications and cloud services

## 📊 Technical Metrics

### Code Organization

- **Total Packages**: 7 shared packages + 2 applications
- **TypeScript Coverage**: 100% across all packages
- **Component Library**: 20+ reusable components
- **Integration Points**: 3 major platforms (YouTube, Discord, Steam)
- **Workspace Structure**: 2 apps, 7 packages, 200+ total files
- **Model Architecture**: Unified canonical models (User, UserIntegration, Game)
- **Build Health**: 73% error reduction achieved (51→14 errors)

### Performance Targets

- **Bundle Size**: < 1MB for frontend
- **API Response Time**: < 200ms average
- **Build Time**: < 2 minutes for full build
- **Type Checking**: < 30 seconds
- **Error Rate**: < 5% critical errors (currently 14 minor warnings)

### Build Environment

- **Node Version**: >=18.0.0
- **Package Manager**: npm >=9.0.0
- **Development Tools**: TypeScript, ESLint, Prettier, Concurrently
- **Hot Reload**: Vite HMR for frontend, Express auto-reload for backend

## 🏗️ Model Architecture (Post-STEP 11)

### Canonical Model System

**STEP 11 Completion**: Successfully deprecated duplicate models and established unified canonical architecture across the monorepo.

#### Core Canonical Models

**User Model** (`packages/shared/src/models/user.ts`):
```typescript
interface User {
  id: string
  email: string
  username: string
  displayName: string
  gamingProfile: {
    primaryPlatforms: PlatformCode[]
    genreAffinities: Record<GenreId, number>
    playstyleArchetypes: PlaystyleArchetype[]
    moodProfile: MoodProfile
    totalPlaytime: number
    gamesPlayed: number
    achievementsCount: number
  }
  integrations: UserIntegration[]
  privacy: { ... }
  preferences: { ... }
  social: { ... }
}
```

**UserIntegration Model** (`packages/shared/src/models/integration.ts`):
```typescript
interface UserIntegration {
  id: string
  userId: string
  platform: PlatformCode
  externalUserId: string
  accessToken?: string
  refreshToken?: string
  scopes: string[]
  status: IntegrationStatus
  isActive: boolean
  isConnected: boolean
  metadata?: IntegrationMetadata
  syncConfig: { ... }
}
```

**Game Model** (`packages/types/src/index.ts`):
```typescript
interface Game {
  id: string
  title: string
  description?: string
  genres: Genre[]
  platforms: Platform[]
  coverImage?: string
  playStatus: PlayStatus
  isFavorite: boolean
  addedAt: Date
  lastPlayed?: Date
  hoursPlayed?: number
  userRating?: number
  globalRating?: number
  releaseYear?: number
}
```

#### Migration Strategy

**Deprecated Models** (with @deprecated comments):
- `UserProfile` → `User` (canonical)
- `Integration` → `UserIntegration` (canonical)
- Legacy Game properties → canonical Game interface

**Backward Compatibility**:
- Deprecated re-exports maintain existing imports
- Gradual migration path for dependent code
- Type safety preserved during transition

### Architecture Benefits

1. **Single Source of Truth**: Canonical models eliminate duplication
2. **Type Safety**: Unified interfaces across all packages
3. **Maintainability**: Single location for model definitions
4. **Scalability**: Extensible architecture for future models
5. **Build Performance**: Reduced compilation times

## 🔐 Security & Privacy

### Data Protection

- **Local Storage**: Primary data storage
- **Optional Integrations**: User-controlled connections
- **API Key Management**: Secure credential handling
- **Privacy-First**: Minimal data collection

### Authentication Strategy

- **JWT Tokens**: Secure API authentication
- **Platform Auth**: OAuth for external services
- **Session Management**: Secure session handling
- **Permission Scopes**: Minimal required permissions

## 🌐 API Documentation

### Core API Endpoints

#### Authentication Endpoints

```text
POST   /api/auth/login          # User authentication
POST   /api/auth/register       # User registration
POST   /api/auth/refresh        # Token refresh
DELETE /api/auth/logout         # Session termination
```

#### User Management

```text
GET    /api/user/profile        # User profile data
PUT    /api/user/profile        # Update profile
GET    /api/user/preferences    # User settings
PUT    /api/user/preferences    # Update preferences
```

#### Game Library

```text
GET    /api/games               # User's game library
POST   /api/games               # Add game to library
GET    /api/games/:id           # Game details
PUT    /api/games/:id           # Update game
DELETE /api/games/:id           # Remove game
```

#### Integrations

```text
GET    /api/integrations        # Connected platforms
POST   /api/integrations/steam  # Connect Steam account
POST   /api/integrations/discord # Connect Discord
POST   /api/integrations/youtube # Connect YouTube
DELETE /api/integrations/:id    # Disconnect platform
```

#### Identity & Recommendations

```text
GET    /api/identity/profile    # Computed identity
GET    /api/recommendations     # Personalized recommendations
POST   /api/sessions            # Log gaming session
GET    /api/sessions            # Gaming history
```

### API Data Models

#### Request/Response Schemas

```typescript
// Authentication
interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserProfile;
}

// Game Management
interface GameRequest {
  title: string;
  platform: PlatformCode;
  genre: string;
  tags: string[];
}

interface GameResponse {
  id: string;
  title: string;
  platform: PlatformCode;
  genre: string;
  tags: string[];
  playtime: number;
  status: GameStatus;
  addedAt: Date;
}
```

## 🧪 Testing Strategy

### Testing Architecture

#### Unit Testing

- **Framework**: Jest + React Testing Library
- **Coverage Target**: 90%+ for critical paths
- **Test Structure**: Feature-based test organization

```text
packages/
├── ui/src/
│   └── __tests__/              # Component unit tests
├── shared/src/
│   └── __tests__/              # Utility function tests
└── identity-engine/src/
    └── __tests__/              # Algorithm tests

apps/
├── web/src/
│   └── __tests__/              # Feature tests
└── api/src/
    └── __tests__/              # API endpoint tests
```

#### Integration Testing

- **API Testing**: Supertest for endpoint testing
- **Database Testing**: SQLite in-memory testing
- **Integration Testing**: Platform service mocking

#### E2E Testing

- **Framework**: Playwright
- **Test Scenarios**: Critical user journeys
- **Coverage**: Main application flows

### Test Commands

```bash
npm run test:unit              # Run unit tests only
npm run test:integration       # Run integration tests
npm run test:e2e               # Run E2E tests
npm run test:coverage          # Generate coverage report
npm run test:watch             # Watch mode for development
```

## 🔄 Advanced Architectural Patterns

### Microservice Patterns

#### Service Mesh Architecture

```text
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │
│   (React)       │◄──►│   (Express)     │
└─────────────────┘    └─────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
            ┌───────▼───┐ ┌───▼───┐ ┌───▼────┐
            │   User    │ │ Game  │ │Identity│
            │  Service  │ │Service│ │ Engine │
            └───────────┘ └───────┘ └────────┘
```

#### Event-Driven Architecture

- **Event Bus**: Centralized event management
- **Event Sourcing**: Audit trail for user actions
- **CQRS Pattern**: Separate read/write operations

### Performance Optimization

#### Frontend Optimization

- **Code Splitting**: Route-based component splitting
- **Lazy Loading**: Dynamic imports for heavy components
- **Virtual Scrolling**: Large list optimization
- **Image Optimization**: WebP format with fallbacks

#### Backend Optimization

- **Database Indexing**: Optimized query performance
- **Caching Strategy**: Redis for frequently accessed data
- **API Rate Limiting**: Prevent abuse and ensure stability
- **Connection Pooling**: Efficient database connections

#### Bundle Optimization

```javascript
// Vite configuration examples
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@gamepilot/ui'],
          integrations: ['@gamepilot/integrations']
        }
      }
    }
  }
}
```

## 🛠️ Development Guidelines

### Code Standards & Best Practices

#### TypeScript Guidelines

**Type Safety**:
- Always use strict TypeScript mode
- Prefer explicit types over `any`
- Use interfaces for object shapes, types for unions/primitives
- Leverage the canonical model system (User, UserIntegration, Game)

**Naming Conventions**:
```typescript
// Interfaces: PascalCase with descriptive names
interface UserProfile { ... }
interface GameLibrary { ... }

// Variables: camelCase
const userProfile = getUserProfile()
const gameLibrary = getGameLibrary()

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.gamepilot.dev'
const MAX_RETRIES = 3

// Files: kebab-case
// user-profile.service.ts
// game-library.component.tsx
```

**Import Organization**:
```typescript
// 1. External libraries
import React from 'react'
import { useState } from 'react'

// 2. Internal packages (@gamepilot/*)
import { User } from '@gamepilot/shared'
import { Button } from '@gamepilot/ui'

// 3. Local modules
import { LocalStorageService } from './services/localStorage'
import { UserProfile } from './types'
```

#### Component Guidelines

**Component Structure**:
```typescript
// Use functional components with hooks
interface ComponentProps {
  title: string
  onAction: () => void
}

export const Component: React.FC<ComponentProps> = ({ 
  title, 
  onAction 
}) => {
  // 1. Hooks (useState, useEffect, etc.)
  const [state, setState] = useState<string>('')
  
  // 2. Event handlers
  const handleClick = useCallback(() => {
    onAction()
  }, [onAction])
  
  // 3. Derived values
  const formattedTitle = title.toUpperCase()
  
  // 4. Effects
  useEffect(() => {
    // Side effects here
  }, [formattedTitle])
  
  // 5. Render
  return (
    <div className="component">
      <h1>{formattedTitle}</h1>
      <button onClick={handleClick}>Action</button>
    </div>
  )
}
```

**State Management**:
- Use Zustand for global state
- Keep component state local when possible
- Prefer derived state over redundant state
- Use selectors for optimized re-renders

#### API Integration Guidelines

**Service Pattern**:
```typescript
// services/game.service.ts
export class GameService {
  private apiClient: ApiClient
  
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }
  
  async getGameLibrary(): Promise<Game[]> {
    try {
      const response = await this.apiClient.get<Game[]>('/games')
      return response.data
    } catch (error) {
      console.error('Failed to fetch game library:', error)
      throw new GameServiceError('Unable to fetch games', error)
    }
  }
}
```

**Error Handling**:
- Always handle API errors gracefully
- Use custom error classes for different error types
- Provide meaningful error messages to users
- Log errors for debugging purposes

### Testing Strategy

#### Unit Testing

**Component Testing**:
```typescript
// Component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Component } from './Component'

describe('Component', () => {
  it('should render title correctly', () => {
    render(<Component title="Test Title" onAction={jest.fn()} />)
    expect(screen.getByText('TEST TITLE')).toBeInTheDocument()
  })
  
  it('should call onAction when button is clicked', () => {
    const mockOnAction = jest.fn()
    render(<Component title="Test" onAction={mockOnAction} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(mockOnAction).toHaveBeenCalledTimes(1)
  })
})
```

**Service Testing**:
```typescript
// game.service.test.ts
import { GameService } from './game.service'
import { mockApiClient } from '../test-utils'

describe('GameService', () => {
  let gameService: GameService
  
  beforeEach(() => {
    gameService = new GameService(mockApiClient)
  })
  
  it('should fetch game library successfully', async () => {
    const mockGames = [{ id: '1', title: 'Test Game' }]
    mockApiClient.get.mockResolvedValue({ data: mockGames })
    
    const result = await gameService.getGameLibrary()
    expect(result).toEqual(mockGames)
  })
})
```

#### Integration Testing

- Test API endpoints with real database
- Test component integration with stores
- Test platform integrations with mock services
- Test end-to-end user workflows

### Git Workflow

#### Branch Strategy

```bash
main                    # Production-ready code
├── develop            # Integration branch
├── feature/user-auth  # Feature branches
├── feature/game-lib
└── hotfix/critical-bug # Hotfixes
```

#### Commit Guidelines

**Commit Message Format**:
```
type(scope): description

feat(auth): add user authentication
fix(games): resolve game loading issue
docs(readme): update installation guide
refactor(store): optimize state management
test(api): add integration tests
```

**Types**:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code refactoring
- `test`: Test additions
- `chore`: Build process or auxiliary changes

### Performance Guidelines

#### Frontend Performance

**React Optimization**:
- Use `React.memo()` for expensive components
- Implement virtual scrolling for large lists
- Use `useCallback()` and `useMemo()` appropriately
- Lazy load routes and heavy components

**Bundle Optimization**:
- Analyze bundle size regularly
- Implement code splitting
- Use dynamic imports for optional features
- Optimize images and assets

#### Backend Performance

**Database Optimization**:
- Use appropriate indexes
- Implement connection pooling
- Cache frequently accessed data
- Monitor query performance

**API Optimization**:
- Implement rate limiting
- Use compression for responses
- Optimize JSON serialization
- Implement proper caching headers

## 🌐 API Architecture Deep Dive

### RESTful API Design

#### Resource-Oriented Design

```typescript
// API Resource structure
interface ApiResource {
  id: string;
  type: string;
  attributes: Record<string, any>;
  relationships?: Record<string, ApiResource>;
  meta?: {
    createdAt: string;
    updatedAt: string;
    version: number;
  };
}

// Example: Game resource
const gameResource: ApiResource = {
  id: 'game-123',
  type: 'games',
  attributes: {
    title: 'Elden Ring',
    genres: ['RPG', 'Action'],
    platforms: ['Steam', 'PlayStation'],
    playStatus: 'playing',
    hoursPlayed: 45.5
  },
  relationships: {
    user: {
      id: 'user-456',
      type: 'users'
    }
  },
  meta: {
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T15:45:00Z',
    version: 3
  }
};
```

#### Endpoint Design Patterns

```typescript
// Standard CRUD operations
interface ApiEndpoints {
  // Collection endpoints
  'GET /api/games': GameListResponse;
  'POST /api/games': CreateGameRequest;
  
  // Resource endpoints
  'GET /api/games/:id': GameResponse;
  'PUT /api/games/:id': UpdateGameRequest;
  'DELETE /api/games/:id': DeleteResponse;
  
  // Nested resources
  'GET /api/users/:userId/games': UserGameListResponse;
  'POST /api/users/:userId/games': AddUserGameRequest;
  
  // Action endpoints
  'POST /api/games/:id/play': PlayGameRequest;
  'POST /api/games/:id/complete': CompleteGameRequest;
  
  // Query endpoints
  'GET /api/games/search': SearchGamesRequest;
  'GET /api/recommendations': GetRecommendationsRequest;
}
```

### Request/Response Patterns

#### Request Validation

```typescript
// Zod schema validation
import { z } from 'zod';

const CreateGameSchema = z.object({
  title: z.string().min(1).max(255),
  genres: z.array(z.string()).min(1).max(5),
  platforms: z.array(z.string()).min(1),
  playStatus: z.enum(['unplayed', 'playing', 'completed', 'backlog', 'abandoned']),
  releaseYear: z.number().min(1970).max(new Date().getFullYear() + 2),
  userRating: z.number().min(1).max(5).optional(),
  tags: z.array(z.string()).max(10).optional()
});

// Middleware implementation
const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
  };
};

// Usage
app.post('/api/games', validateRequest(CreateGameSchema), createGameController);
```

#### Response Formatting

```typescript
// Standard API response format
interface ApiResponse<T = any> {
  data?: T;
  errors?: ApiError[];
  meta: {
    timestamp: string;
    requestId: string;
    version: string;
  };
  links?: {
    self: string;
    related?: Record<string, string>;
  };
}

// Success response
const createSuccessResponse = <T>(data: T, meta?: Partial<ApiResponse['meta']>): ApiResponse<T> => {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      version: '1.0.0',
      ...meta
    }
  };
};

// Error response
const createErrorResponse = (errors: ApiError[]): ApiResponse => {
  return {
    errors,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      version: '1.0.0'
    }
  };
};
```

### Authentication & Authorization

#### JWT Token Strategy

```typescript
// JWT token structure
interface JwtPayload {
  sub: string; // User ID
  iat: number; // Issued at
  exp: number; // Expires at
  aud: string; // Audience (gamepilot-api)
  iss: string; // Issuer
  scope: string[]; // Permissions
  platform?: string; // Platform integration
}

// Token generation
const generateToken = (user: User, platform?: string): string => {
  const payload: JwtPayload = {
    sub: user.id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    aud: 'gamepilot-api',
    iss: 'gamepilot-auth',
    scope: user.permissions,
    platform
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET!);
};

// Middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json(createErrorResponse([{
      code: 'MISSING_TOKEN',
      message: 'Authentication token required'
    }]));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json(createErrorResponse([{
      code: 'INVALID_TOKEN',
      message: 'Invalid or expired token'
    }]));
  }
};
```

#### Permission System

```typescript
// Permission definitions
enum Permission {
  READ_GAMES = 'games:read',
  WRITE_GAMES = 'games:write',
  DELETE_GAMES = 'games:delete',
  READ_INTEGRATIONS = 'integrations:read',
  WRITE_INTEGRATIONS = 'integrations:write',
  ADMIN = 'admin'
}

// Permission checking middleware
const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    
    if (!user.scope.includes(permission) && !user.scope.includes(Permission.ADMIN)) {
      return res.status(403).json(createErrorResponse([{
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `Permission ${permission} required`
      }]));
    }
    
    next();
  };
};

// Usage
app.get('/api/games', authenticateToken, requirePermission(Permission.READ_GAMES), getGamesController);
app.post('/api/games', authenticateToken, requirePermission(Permission.WRITE_GAMES), createGameController);
```

### Database Integration Patterns

#### Repository Pattern

```typescript
// Base repository interface
interface IRepository<T, K = string> {
  findById(id: K): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: K, data: Partial<T>): Promise<T>;
  delete(id: K): Promise<void>;
}

// Game repository implementation
class GameRepository implements IRepository<Game, string> {
  constructor(private db: Database) {}
  
  async findById(id: string): Promise<Game | null> {
    const stmt = this.db.prepare('SELECT * FROM games WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.mapRowToGame(row) : null;
  }
  
  async findAll(filter: Partial<Game> = {}): Promise<Game[]> {
    let query = 'SELECT * FROM games WHERE 1=1';
    const params: any[] = [];
    
    if (filter.userId) {
      query += ' AND user_id = ?';
      params.push(filter.userId);
    }
    
    if (filter.playStatus) {
      query += ' AND play_status = ?';
      params.push(filter.playStatus);
    }
    
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params);
    return rows.map(this.mapRowToGame);
  }
  
  async create(data: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>): Promise<Game> {
    const id = generateId();
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(`
      INSERT INTO games (id, title, genres, platforms, play_status, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      data.title,
      JSON.stringify(data.genres),
      JSON.stringify(data.platforms),
      data.playStatus,
      data.userId,
      now,
      now
    );
    
    return this.findById(id) as Promise<Game>;
  }
  
  private mapRowToGame(row: any): Game {
    return {
      id: row.id,
      title: row.title,
      genres: JSON.parse(row.genres),
      platforms: JSON.parse(row.platforms),
      playStatus: row.play_status,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      // ... other fields
    };
  }
}
```

#### Transaction Management

```typescript
// Transaction helper
class TransactionManager {
  constructor(private db: Database) {}
  
  async withTransaction<T>(
    operations: (tx: Database) => Promise<T>
  ): Promise<T> {
    const tx = this.db.transaction(operations);
    try {
      const result = await tx();
      return result;
    } catch (error) {
      // Transaction automatically rolls back on error
      throw error;
    }
  }
}

// Usage example
const transactionManager = new TransactionManager(db);

const addGameWithIntegrations = async (gameData: CreateGameData, integrations: IntegrationData[]) => {
  return await transactionManager.withTransaction(async (tx) => {
    // Create game
    const game = await gameRepository.create(gameData);
    
    // Add integrations
    for (const integration of integrations) {
      await integrationRepository.create({
        ...integration,
        gameId: game.id
      });
    }
    
    // Update user stats
    await userRepository.updateStats(gameData.userId, {
      totalGames: { $increment: 1 }
    });
    
    return game;
  });
};
```

### Caching Strategy

#### Multi-Level Caching

```typescript
// Cache interface
interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Memory cache implementation
class MemoryCache implements ICache {
  private cache = new Map<string, { value: any; expiry: number }>();
  
  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  
  async set<T>(key: string, value: T, ttl = 300): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttl * 1000)
    });
  }
  
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }
  
  async clear(): Promise<void> {
    this.cache.clear();
  }
}

// Redis cache implementation
class RedisCache implements ICache {
  constructor(private redis: Redis) {}
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set<T>(key: string, value: T, ttl = 300): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
  
  async clear(): Promise<void> {
    await this.redis.flushdb();
  }
}

// Cache decorator
const cached = (cache: ICache, ttl = 300) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
      
      // Try cache first
      const cachedResult = await cache.get(cacheKey);
      if (cachedResult !== null) {
        return cachedResult;
      }
      
      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      await cache.set(cacheKey, result, ttl);
      
      return result;
    };
    
    return descriptor;
  };
};

// Usage
class GameService {
  @cached(new MemoryCache(), 600) // 10 minutes cache
  async getPopularGames(): Promise<Game[]> {
    // Expensive database query
    return await gameRepository.findAll({ 
      playStatus: 'playing',
      limit: 10 
    });
  }
}
```

## 🔍 Monitoring & Observability

### Application Monitoring

#### Frontend Monitoring

- **Error Tracking**: Sentry integration
- **Performance Metrics**: Web Vitals monitoring
- **User Analytics**: Feature usage tracking
- **A/B Testing**: Feature flag management

#### Backend Monitoring

- **API Performance**: Response time tracking
- **Error Rates**: Failed request monitoring
- **Database Performance**: Query optimization
- **Resource Usage**: Memory and CPU monitoring

### Logging Strategy

#### Structured Logging

```typescript
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  userId?: string;
  action: string;
  metadata: Record<string, any>;
}

// Implementation example
class Logger {
  static log(entry: Omit<LogEntry, 'timestamp'>) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      ...entry
    };
    
    console.log(JSON.stringify(logEntry));
  }
  
  static error(message: string, error: Error, metadata?: Record<string, any>) {
    this.log({
      level: 'error',
      service: 'gamepilot-api',
      action: message,
      metadata: {
        error: error.message,
        stack: error.stack,
        ...metadata
      }
    });
  }
}
```

#### Log Levels

- **DEBUG**: Detailed development information
- **INFO**: General application flow
- **WARN**: Potential issues that don't stop execution
- **ERROR**: Critical errors requiring attention

#### Monitoring Stack

**Frontend Monitoring**:
- **Development Tools**: TypeScript, ESLint, Prettier, Concurrently
- **Hot Reload**: Vite HMR for frontend, Express auto-reload for backend

### Production Deployment

- **Frontend**: Static hosting (Vercel, Netlify, or Docker)
- **Backend**: Node.js server with PM2 or Docker
- **Database**: SQLite with backup strategies
- **Environment Variables**: Secure configuration management
- **CI/CD**: GitHub Actions or similar pipeline

### Environment Configuration

- **Development**: Local SQLite, mock integrations
- **Staging**: Production-like environment with test data
- **Production**: Full integrations, optimized builds
- **Monitoring**: Error tracking, performance metrics

## 🔐 Security & Privacy

### Data Protection

- **Local Storage**: Primary data storage
- **Optional Integrations**: User-controlled connections
- **API Key Management**: Secure credential handling
- **Privacy-First**: Minimal data collection

### Authentication Strategy

- **JWT Tokens**: Secure API authentication
- **Platform Auth**: OAuth for external services
- **Session Management**: Secure session handling
- **Permission Scopes**: Minimal required permissions

## 🚨 Troubleshooting & FAQ

### Common Development Issues

#### Build & Compilation Issues

**Problem**: TypeScript compilation errors after STEP 11
```bash
# Solution: Clean build cache
npm run clean
npm run build

# If issues persist, check for deprecated model usage
grep -r "UserProfile\|Integration" apps/web/src/ --exclude-dir=node_modules
```

**Problem**: Package dependency conflicts
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check workspace dependencies
npm ls --workspaces
```

**Problem**: Vite dev server not starting
```bash
# Solution: Check port conflicts
npm run dev:web -- --port 3001

# Or kill existing processes
npx kill-port 3000
```

#### Integration Issues

**Problem**: Steam API integration not working
```typescript
// Check API key configuration
const steamApiKey = process.env.STEAM_API_KEY
if (!steamApiKey) {
  console.error('STEAM_API_KEY not configured')
}

// Verify API endpoint
const response = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=76561198000000000`)
```

**Problem**: Discord bot permissions
```json
// Required Discord bot permissions
{
  "permissions": [
    "VIEW_CHANNEL",
    "SEND_MESSAGES",
    "READ_MESSAGE_HISTORY",
    "EMBED_LINKS"
  ]
}
```

#### State Management Issues

**Problem**: Zustand store not updating
```typescript
// Solution: Ensure proper selector usage
const useGameStore = (selector: (state: GameState) => T) => {
  return useStore(gameStore, selector)
}

// Usage
const games = useGameStore(state => state.games)
```

**Problem**: LocalStorage persistence issues
```typescript
// Solution: Handle localStorage errors gracefully
const safeLocalStorage = {
  get: (key: string) => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn('LocalStorage access denied:', error)
      return null
    }
  }
}
```

### Performance Issues

#### Frontend Performance

**Problem**: Slow initial load time
```typescript
// Solution: Implement lazy loading
const LazyComponent = React.lazy(() => import('./HeavyComponent'))

// Use with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

**Problem**: Large bundle size
```bash
# Analyze bundle size
npm run build -- --analyze

# Check for large dependencies
npm ls --depth=0 | grep -E '[0-9]+\.[0-9]+\.[0-9]+.*MB'
```

#### Backend Performance

**Problem**: Database query slow
```sql
-- Solution: Add indexes
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_integrations_platform ON integrations(platform);
```

**Problem**: API response time high
```typescript
// Solution: Implement caching
const cache = new Map()

const getCachedData = async (key: string, fetcher: () => Promise<any>) => {
  if (cache.has(key)) {
    return cache.get(key)
  }
  
  const data = await fetcher()
  cache.set(key, data)
  return data
}
```

### Environment Setup Issues

#### Development Environment

**Problem**: Node.js version compatibility
```bash
# Check current version
node --version  # Should be >=18.0.0

# Use nvm to manage versions
nvm install 18
nvm use 18
nvm alias default 18
```

**Problem**: Environment variables not loading
```bash
# Create .env file
cp .env.example .env.local

# Verify variables are loaded
npm run env:check
```

#### Docker Issues

**Problem**: Container build fails
```dockerfile
# Solution: Use multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### FAQ

#### Q: How do I add a new platform integration?
**A**: Follow these steps:
1. Create integration in `packages/integrations/src/[platform]/`
2. Add platform code to `packages/shared/src/types/platforms.ts`
3. Implement adapter pattern in `packages/integrations/src/adapters/`
4. Add API routes in `apps/api/src/routes/[platform].ts`
5. Update frontend service in `apps/web/src/services/[platform].ts`

#### Q: What's the difference between canonical and deprecated models?
**A**: 
- **Canonical models**: Single source of truth in `packages/shared/src/models/`
- **Deprecated models**: Old interfaces with `@deprecated` comments pointing to canonical versions
- **Migration path**: Gradually replace deprecated usage with canonical imports

#### Q: How do I debug state management issues?
**A**: Use these tools:
```typescript
// Enable Zustand devtools
import { devtools } from 'zustand/middleware'

const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      // store implementation
    }),
    { name: 'game-store' }
  )
)

// Log state changes
useGameStore.subscribe(
  (state) => console.log('Game store changed:', state)
)
```

#### Q: How do I optimize the build for production?
**A**: 
```typescript
// vite.config.ts
export default defineConfig({
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
    minify: 'terser',
    sourcemap: false
  }
})
```

#### Q: How do I handle authentication across different platforms?
**A**: Use the unified auth system:
```typescript
// Canonical authentication flow
const authenticate = async (platform: PlatformCode) => {
  const integration = await getIntegration(platform)
  if (!integration) {
    throw new Error(`${platform} integration not found`)
  }
  
  return await integration.authenticate()
}
```

#### Q: What's the recommended testing strategy?
**A**: 
- **Unit tests**: 70% coverage for business logic
- **Integration tests**: API endpoints and database operations
- **E2E tests**: Critical user workflows
- **Performance tests**: Bundle size and load times

#### Q: How do I contribute to the project?
**A**: 
1. Fork the repository
2. Create feature branch from `develop`
3. Follow commit message guidelines
4. Add tests for new features
5. Submit pull request with description

### Emergency Procedures

#### Database Recovery
```bash
# Backup current database
cp gamepilot.db gamepilot.backup.db

# Restore from backup
cp gamepilot.backup.db gamepilot.db

# Check database integrity
sqlite3 gamepilot.db "PRAGMA integrity_check;"
```

#### Rollback Deployment
```bash
# Git rollback
git revert <commit-hash>
git push origin main

# Or rollback to specific tag
git checkout v1.0.0
git push -f origin main
```

#### Emergency Hotfix
```bash
# Create hotfix branch
git checkout -b hotfix/critical-bug

# Apply fix and test
# ... make changes ...

# Merge directly to main
git checkout main
git merge hotfix/critical-bug
git tag v1.0.1
git push origin main --tags
```

---

## 📚 Additional Resources

*This codemap is a living document that evolves with the project. Last updated: January 16, 2026*
