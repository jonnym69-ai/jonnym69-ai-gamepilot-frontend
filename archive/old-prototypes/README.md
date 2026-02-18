# GamePilot Archive - Old Prototypes

This directory contains archived prototype applications and test UIs that were moved during the cleanup process.

## Archived Items

### 1. Test HTML Page
- **File**: `test.html`
- **Original Location**: `apps/web/test.html`
- **Description**: Standalone test HTML page for development verification
- **Archived**: 2026-01-25

### 2. API Test Route
- **File**: `test.ts`
- **Original Location**: `apps/api/src/routes/test.ts`
- **Description**: Test route for Steam authentication verification
- **Archived**: 2026-01-25

### 3. Prototype Core Modules
- **Directory**: `src/`
- **Original Location**: `src/` (root)
- **Contents**:
  - `core/genre/` - Genre classification prototypes
  - `core/mood/` - Mood analysis prototypes
- **Description**: Early prototype modules for genre and mood analysis
- **Archived**: 2026-01-25

## Notes

- These items were archived to clean up the monorepo structure
- GamePilot now only contains the main web application (`apps/web`) and API (`apps/api`)
- All development scripts have been updated to only serve the main GamePilot application
- The archived items are preserved for reference but are not part of the active codebase

## Restoration

If needed, these items can be restored by moving them back to their original locations and updating the relevant import statements and route configurations.
