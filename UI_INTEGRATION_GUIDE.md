# 🎮 Enhanced Mood System - UI Integration Guide

## 📋 Quick Integration Steps

### 1. Add Mood Selector to Navigation Bar

**File**: `apps/web/src/components/Navigation.tsx`

```tsx
import { SimpleMoodSelector } from './SimpleMoodSelector'

// Add this to your Navigation component
<SimpleMoodSelector 
  onMoodChange={(primary, secondary) => {
    // Handle mood selection
    console.log('Mood selected:', primary, secondary)
  }}
  variant="compact"
  className="mb-4"
/>
```

### 2. Add Mood Recommendations to Home Page

**File**: `apps/web/src/pages/Home.tsx`

```tsx
import { useMoodRecommendations } from '../hooks/useMoodRecommendations'

// Add this to your Home component
function Home() {
  const { games } = useLibraryStore() // Your existing games
  
  const {
    selectMood,
    clearMood,
    recommendations,
    primaryMoodInfo,
    hasRecommendations
  } = useMoodRecommendations({
    games,
    onRecommendationsChange: (recs) => {
      // Update your UI with mood recommendations
      console.log('Mood recommendations:', recs)
    }
  })

  return (
    <div>
      {/* Your existing Home content */}
      
      {/* Add Mood Recommendations Section */}
      {hasRecommendations && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Mood-Based Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map(game => (
              <div key={game.id} className="glass-morphism rounded-lg p-4">
                <h3 className="text-lg font-semibold">{game.title}</h3>
                <p className="text-sm text-gray-400">
                  Perfect for {primaryMoodInfo?.name.toLowerCase()} mood
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

### 3. Enhance Library View

**File**: `apps/web/src/features/library/LibrarySimple.tsx`

```tsx
import { SimpleMoodSelector } from '../../components/SimpleMoodSelector'
import { useMoodRecommendations } from '../../hooks/useMoodRecommendations'

// Add this to your existing LibrarySimple component
function LibrarySimple() {
  const { games, actions } = useLibraryStore()
  
  const {
    selectMood,
    clearMood,
    recommendations,
    primaryMoodInfo,
    secondaryMoodInfo,
    hasRecommendations,
    isLoading
  } = useMoodRecommendations({
    games,
    onRecommendationsChange: (recs) => {
      // You can store mood recommendations in state or display them directly
    }
  })

  const displayGames = hasRecommendations ? recommendations : games

  return (
    <div className="space-y-6">
      {/* Add Mood Toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          {hasRecommendations ? 'Mood Recommendations' : 'Game Library'}
        </h1>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowMoodSelector(!showMoodSelector)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            {showMoodSelector ? 'Hide Mood' : 'Select Mood'}
          </button>
          
          {hasRecommendations && (
            <button
              onClick={clearMood}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
            >
              Show All Games
            </button>
          )}
        </div>
      </div>

      {/* Mood Selector */}
      {showMoodSelector && (
        <SimpleMoodSelector
          onMoodChange={selectMood}
          variant="full"
        />
      )}

      {/* Current Mood Display */}
      {hasRecommendations && primaryMoodInfo && (
        <div className="glass-morphism rounded-xl p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{primaryMoodInfo.emoji}</span>
            <span className="text-white font-medium">{primaryMoodInfo.name}</span>
            {secondaryMoodInfo && (
              <>
                <span className="text-gray-400">+</span>
                <span className="text-2xl">{secondaryMoodInfo.emoji}</span>
                <span className="text-white font-medium">{secondaryMoodInfo.name}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayGames.map((game) => (
          <div key={game.id} className="glass-morphism rounded-lg p-4">
            {/* Your existing GameCard content */}
            <h3 className="text-lg font-semibold text-white">{game.title}</h3>
            
            {/* Add mood score if available */}
            {hasRecommendations && game.moodScore && (
              <div className="text-right mb-2">
                <div className="text-xl font-bold text-blue-400">
                  {Math.round(game.moodScore)}%
                </div>
                <div className="text-xs text-gray-400">mood match</div>
              </div>
            )}
            
            {/* Rest of your GameCard content */}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 4. Add Mood Filter to Search Bar

**File**: `apps/web/src/components/SearchBar.tsx`

```tsx
import { SimpleMoodSelector } from './SimpleMoodSelector'

// Add mood filter to your existing search functionality
export function SearchBar({ onSearch, onMoodFilter }) {
  const [showMoodSelector, setShowMoodSelector] = useState(false)

  return (
    <div className="space-y-4">
      {/* Your existing search input */}
      <input
        type="text"
        placeholder="Search games..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full px-4 py-2 bg-gray-800 rounded-lg text-white"
      />
      
      {/* Mood Filter */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400">Filter by mood:</span>
        <button
          onClick={() => setShowMoodSelector(!showMoodSelector)}
          className={`px-3 py-1 rounded-lg text-sm ${
            currentMood ? 'bg-blue-600' : 'bg-gray-700'
          }`}
        >
          {currentMood ? currentMood : 'Any Mood'}
        </button>
      </div>
      
      {showMoodSelector && (
        <SimpleMoodSelector
          onMoodChange={(primary, secondary) => {
            onMoodFilter({ primary, secondary })
            setShowMoodSelector(false)
          }}
          variant="compact"
        />
      )}
    </div>
  )
}
```

## 🎯 Integration Points in GamePilot

### 1. **Navigation Bar** (Top Level)
- Add compact mood selector for quick access
- Shows current mood selection
- Easy to toggle on/off

### 2. **Home Page** (Dashboard)
- Show top 3 mood-based recommendations
- Highlights mood-matched games
- Encourages mood exploration

### 3. **Library View** (Main Feature)
- Full mood selector with hybrid combinations
- Toggle between all games and mood recommendations
- Shows mood match scores on game cards

### 4. **Search & Filters** (Utility)
- Add mood as a filter option
- Combine with existing search functionality
- Persistent mood selection

## 🔧 Customization Options

### **Styling**
The mood selector uses GamePilot's existing `glass-morphism` design system. You can customize:

```css
/* Custom mood button colors */
.mood-button {
  /* Your custom styles */
}

/* Custom mood indicator */
.energy-indicator {
  /* Your custom styles */
}
```

### **Behavior**
Adjust the mood scoring algorithm in `useMoodRecommendations.ts`:

```typescript
// Modify scoring weights
const genreWeight = 0.4  // Default: 40%
const tagWeight = 0.3     // Default: 30%
const energyWeight = 0.15 // Default: 15%
const socialWeight = 0.15 // Default: 15%
```

### **Mood Data**
Add custom moods or modify existing ones in `enhancedMoods.ts`:

```typescript
{
  id: 'custom-mood',
  name: 'Custom Mood',
  emoji: '🎯',
  // ... other properties
}
```

## 🚀 Quick Start

1. **Copy the components**: `SimpleMoodSelector.tsx` and `useMoodRecommendations.ts`
2. **Add to navigation**: Include the mood selector in your Navigation component
3. **Test integration**: Try the mood selector with your existing game library
4. **Customize**: Adjust styling and behavior as needed

## 🎮 Expected Results

After integration, users will be able to:

- **Select moods** based on how they're feeling
- **Combine moods** for hybrid recommendations
- **See mood scores** on game cards
- **Toggle between** all games and mood recommendations
- **Get personalized** suggestions based on emotional state

The enhanced mood system will make GamePilot much more personalized and intuitive! 🎭✨
