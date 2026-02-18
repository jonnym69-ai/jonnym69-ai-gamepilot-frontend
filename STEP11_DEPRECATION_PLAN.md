# STEP 11: Model Deprecation and Cleanup Plan

## Overview
This document outlines the safe deprecation and removal of duplicate User and UserIntegration models across the GamePilot monorepo, consolidating all models to use the canonical versions in `packages/shared/src/models/`.

## Current State Analysis

### ✅ Canonical Models (Keep)
- **User**: `packages/shared/src/models/user.ts` - Complete canonical User model
- **UserIntegration**: `packages/shared/src/models/integration.ts` - Complete canonical UserIntegration model

### ❌ Duplicate Models (Remove/Deprecate)

#### User Model Duplicates:
1. **`packages/types/src/index.ts`**:
   - `UserProfile` interface (lines 118-136)
   - `UserPreferences` interface (lines 86-110)
   - **Action**: Deprecate and re-export canonical types

2. **`apps/web/src/store/authStore.ts`**:
   - `User` interface (lines 10-14) - Legacy AuthUser
   - `EnhancedUser` interface (lines 17-25)
   - **Action**: Remove (already replaced by canonical in auth context)

3. **`apps/web/src/features/identity/types.ts`**:
   - `UserProfile` interface (lines 10-34)
   - `UserPreferences` interface (lines 38-73)
   - `UserPlaystyle` interface (lines 77-80)
   - `UserMood` interface (lines 99-107)
   - `UserStats` interface (lines 109-119)
   - `UserIdentity` interface (lines 121-127)
   - **Action**: Remove (replaced by canonical User.gamingProfile)

4. **`apps/web/src/types/index.ts`**:
   - `UserPreferences` interface (lines 47-58)
   - **Action**: Remove (duplicate of canonical)

5. **`apps/web/src/stores/useGamePilotStore.ts`**:
   - `UserPreferences` interface (lines 27-33)
   - **Action**: Remove (duplicate of canonical)

#### Integration Model Duplicates:
1. **`packages/types/src/index.ts`**:
   - `Integration` interface (lines 176-186)
   - **Action**: Deprecate and re-export canonical UserIntegration

2. **`apps/web/src/stores/useGamePilotStore.ts`**:
   - `IntegrationStatus` interface (lines 6-15)
   - **Action**: Remove (replaced by canonical UserIntegration.status)

## Deprecation Strategy

### Phase 1: Safe Re-exports (Non-breaking)
1. **Update `packages/types/src/index.ts`**:
   - Import canonical User and UserIntegration
   - Re-export with legacy names for backward compatibility
   - Add @deprecated comments

### Phase 2: Remove Frontend Duplicates (Breaking)
1. **Remove duplicate interfaces from frontend files**
2. **Update imports to use canonical models**
3. **Update component implementations**

### Phase 3: Clean Up Legacy References
1. **Remove @deprecated re-exports**
2. **Update any remaining legacy imports**
3. **Verify no broken references**

## Implementation Steps

### Step 1: Update packages/types (Non-breaking)
```typescript
// Add to packages/types/src/index.ts
// @deprecated Import from @gamepilot/shared/models/user instead
export type UserProfile = import('@gamepilot/shared/models/user').User

// @deprecated Import from @gamepilot/shared/models/integration instead  
export type Integration = import('@gamepilot/shared/models/integration').UserIntegration
```

### Step 2: Remove Frontend Duplicates
- Remove duplicate interfaces from `apps/web/src/` files
- Update imports to use canonical models
- Update any code using the old interfaces

### Step 3: Update Component Implementations
- Update components to use canonical User structure
- Update auth store to use canonical models
- Update any type references

### Step 4: Final Cleanup
- Remove deprecated re-exports
- Verify all imports use canonical models
- Run tests to ensure no breaking changes

## Files to Modify

### High Priority (Breaking Changes)
1. `packages/types/src/index.ts` - Add deprecation re-exports
2. `apps/web/src/store/authStore.ts` - Remove duplicate User interfaces
3. `apps/web/src/features/identity/types.ts` - Remove all duplicate User interfaces
4. `apps/web/src/types/index.ts` - Remove duplicate UserPreferences
5. `apps/web/src/stores/useGamePilotStore.ts` - Remove duplicate interfaces

### Medium Priority (Import Updates)
1. Update any files importing from deprecated interfaces
2. Update component implementations using old structures
3. Update type references in function signatures

### Low Priority (Final Cleanup)
1. Remove deprecated re-exports from packages/types
2. Update documentation
3. Verify test coverage

## Risk Mitigation

### Backward Compatibility
- Use re-exports during transition period
- Maintain existing API contracts
- Gradual migration approach

### Testing Strategy
- Run existing tests after each change
- Test import updates
- Verify component functionality
- Check for TypeScript errors

### Rollback Plan
- Keep git history for easy rollback
- Document changes clearly
- Test in development environment first

## Success Criteria

### ✅ Completion Indicators
- All duplicate User interfaces removed
- All duplicate UserIntegration interfaces removed  
- All imports use canonical models
- No TypeScript compilation errors
- All tests passing
- No broken component functionality

### 📊 Metrics
- Zero duplicate User/Integration interfaces
- 100% canonical model usage
- Zero import errors
- Zero TypeScript errors
- Maintained test coverage

## Timeline

### Phase 1: Safe Re-exports (15 minutes)
- Update packages/types with deprecation re-exports
- Test compilation

### Phase 2: Frontend Cleanup (30 minutes)  
- Remove frontend duplicate interfaces
- Update imports
- Test components

### Phase 3: Final Cleanup (15 minutes)
- Remove deprecated re-exports
- Final verification
- Documentation update

**Total Estimated Time: 1 hour**

## Next Steps

1. **Begin Phase 1**: Update packages/types with safe re-exports
2. **Verify compilation**: Ensure no breaking changes
3. **Proceed to Phase 2**: Remove frontend duplicates
4. **Complete Phase 3**: Final cleanup and verification

This plan ensures a safe, non-breaking migration to canonical models while maintaining full system functionality.
