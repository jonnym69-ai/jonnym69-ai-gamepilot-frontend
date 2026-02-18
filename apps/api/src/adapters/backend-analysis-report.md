# Backend Legacy Model Analysis Report

## Overview
This report identifies all backend services, controllers, and routes that use legacy User and Integration models, and assesses their migration readiness.

## 1. Authentication Services

### File: `apps/api/src/auth/authService.ts`
- **Legacy Model Used**: `AuthUser` interface
- **Current Structure**: 
  ```typescript
  export interface AuthUser {
    id: string;
    username: string;
    email: string;
  }
  ```
- **Usage**: JWT token generation, user authentication, middleware
- **Migration Assessment**: ✅ **CLEAN MIGRATION**
  - Simple 3-field interface
  - Direct mapping to canonical User basic fields
  - No complex logic to preserve
  - Can be replaced with adapter immediately

### File: `apps/api/src/routes/auth.ts`
- **Legacy Model Used**: `AuthUser` (from authService)
- **Current Structure**: Uses AuthUser in `/me` and `/verify` endpoints
- **Usage**: Returns user profile data for authenticated requests
- **Migration Assessment**: ✅ **CLEAN MIGRATION**
  - Simple data exposure
  - No business logic dependent on legacy structure
  - Can use adapter to convert canonical User → AuthUser response

## 2. Steam Integration Services

### File: `apps/api/src/steam/steamClient.ts`
- **Legacy Model Used**: `SteamProfile` interface
- **Current Structure**:
  ```typescript
  export interface SteamProfile {
    steamId: string
    personaName: string
    profileUrl: string
    avatar: string
    avatarMedium: string
    avatarFull: string
    personaState: number
    personaStateFlags: number
    gameServerIp?: string
    gameServerPort?: number
    gameExtraInfo?: string
    gameId?: string
  }
  ```
- **Usage**: Steam API integration, profile fetching
- **Migration Assessment**: ✅ **CLEAN MIGRATION**
  - Platform-specific data structure
  - Maps directly to UserIntegration.metadata.steam
  - Can be adapted to canonical UserIntegration format
  - No breaking changes to Steam API calls

### File: `apps/api/src/routes/steam.ts`
- **Legacy Model Used**: `SteamProfile` (indirectly via steamClient)
- **Usage**: Steam profile and library endpoints
- **Migration Assessment**: ✅ **CLEAN MIGRATION**
  - Simple proxy to steamClient
  - Response format can be adapted
  - No business logic dependent on structure

### File: `apps/api/src/routes/steam/games.ts`
- **Legacy Model Used**: None (uses mock data)
- **Usage**: Steam library integration
- **Migration Assessment**: ✅ **CLEAN MIGRATION**
  - No legacy model dependencies
  - Ready for canonical integration

## 3. Mood Analysis Services

### File: `apps/api/src/mood/types.ts`
- **Legacy Model Used**: Custom mood analysis types
- **Current Structure**: `MoodVector`, `BehavioralSignal`, `NormalizedFeatures`
- **Usage**: Mood analysis framework
- **Migration Assessment**: ⚠️ **NEEDS SPECIAL HANDLING**
  - Complex domain-specific types
  - Tightly coupled to mood analysis algorithms
  - Need adapter to map canonical User.moodProfile → MoodVector
  - Migration requires careful data transformation

### File: `apps/api/src/mood/moodService.ts`
- **Legacy Model Used**: `PlayHistory`, `Game`, `Activity` from @gamepilot/types
- **Usage**: Main mood analysis orchestration
- **Migration Assessment**: ⚠️ **NEEDS SPECIAL HANDLING**
  - Depends on canonical types from shared package
  - Complex business logic for mood computation
  - Needs adapter to work with canonical User structure
  - Cannot be migrated directly without algorithm updates

### File: `apps/api/src/mood/featureExtraction.ts`
- **Legacy Model Used**: `BehavioralSignal`, `PlayHistory`, `Game`
- **Usage**: Feature extraction for mood analysis
- **Migration Assessment**: ⚠️ **NEEDS SPECIAL HANDLING**
  - Algorithm-dependent on signal structure
  - Needs adapter to transform canonical User data
  - Complex migration path

### File: `apps/api/src/mood/signalCollection.ts`
- **Legacy Model Used**: `PlayHistory`, `Game`, `BehavioralSignal`
- **Usage**: Signal collection from user activity
- **Migration Assessment**: ⚠️ **NEEDS SPECIAL HANDLING**
  - Dependent on PlayHistory structure
  - Needs adapter for canonical User.gamingProfile
  - Complex data transformation required

### File: `apps/api/src/mood/moodInference.ts`
- **Legacy Model Used**: Mood analysis types
- **Usage**: Mood inference algorithms
- **Migration Assessment**: ⚠️ **NEEDS SPECIAL HANDLING**
  - Core algorithm component
  - Dependent on specific data structures
  - Requires adapter layer for canonical integration

### File: `apps/api/src/routes/mood.ts`
- **Legacy Model Used**: `PlayHistory`, `Game`, `Activity`
- **Usage**: Mood analysis HTTP endpoints
- **Migration Assessment**: ⚠️ **NEEDS SPECIAL HANDLING**
  - Depends on moodService which needs adaptation
  - Response formats may need adjustment
  - Authentication integration required

## 4. Game Management Services

### File: `apps/api/src/routes/games.ts`
- **Legacy Model Used**: None (uses inline game definitions)
- **Usage**: Game CRUD operations
- **Migration Assessment**: ✅ **CLEAN MIGRATION**
  - No legacy model dependencies
  - Uses inline data structures
  - Ready for canonical Game model integration

## 5. Integration Status Summary

### Clean Migration Areas (✅ Ready)
1. **Authentication System** (`authService.ts`, `routes/auth.ts`)
   - Simple AuthUser → canonical User mapping
   - No complex business logic
   - Immediate migration possible

2. **Steam Integration** (`steamClient.ts`, `routes/steam.ts`)
   - Platform-specific mapping to UserIntegration
   - Direct metadata mapping
   - No algorithmic dependencies

3. **Game Management** (`routes/games.ts`)
   - No legacy dependencies
   - Ready for canonical models

### Special Handling Required (⚠️ Complex)
1. **Mood Analysis System** (entire `mood/` directory)
   - Complex domain-specific types
   - Algorithm-dependent data structures
   - Requires comprehensive adapter layer
   - Need gradual migration approach

2. **Signal Collection & Processing**
   - Dependent on PlayHistory structure
   - Needs transformation from canonical User.gamingProfile
   - Complex data mapping required

## 6. Migration Strategy Recommendations

### Phase 1: Immediate (Clean Areas)
- Create adapters for AuthUser ↔ canonical User
- Create adapters for SteamProfile ↔ UserIntegration
- Update authentication routes to use adapters
- Update Steam routes to use adapters

### Phase 2: Complex (Mood Analysis)
- Create comprehensive mood analysis adapter
- Map canonical User.moodProfile → MoodVector
- Transform User.gamingProfile → behavioral signals
- Gradual migration with fallback to legacy system

### Phase 3: Integration
- Remove direct legacy model usage
- Standardize on canonical models throughout
- Remove adapter layers once migration complete

## 7. Risk Assessment

### Low Risk Areas
- Authentication: Simple data mapping
- Steam Integration: Platform-specific, isolated
- Game Management: No legacy dependencies

### Medium Risk Areas
- Mood Analysis: Complex but well-contained
- Signal Processing: Algorithm-dependent but testable

### High Risk Areas
- Cross-system data flow between mood and authentication
- Real-time mood updates during user sessions
- Performance impact of data transformation

## 8. Dependencies

### External Dependencies
- Steam Web API (no changes needed)
- JWT libraries (compatible)
- Express middleware (compatible)

### Internal Dependencies
- @gamepilot/types (already using canonical)
- @gamepilot/shared (new canonical models)
- Mood analysis algorithms (need adaptation)

## 9. Testing Requirements

### Unit Tests
- Adapter layer functions
- Data transformation accuracy
- Backward compatibility

### Integration Tests
- Authentication flow with adapters
- Steam integration with canonical models
- Mood analysis with transformed data

### Performance Tests
- Adapter overhead measurement
- Memory usage during transformation
- Response time impact

## 10. Next Steps

1. **Create adapter layers** for clean migration areas
2. **Implement mood analysis adapter** for complex areas
3. **Update authentication middleware** to use canonical models
4. **Test integration points** between systems
5. **Gradual rollout** with feature flags
6. **Monitor performance** and user impact
7. **Remove legacy code** once migration verified
