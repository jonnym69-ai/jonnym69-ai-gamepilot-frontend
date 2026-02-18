import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { GameCard } from '../../features/library/components/GameCard'
import { PageErrorBoundary } from '../../components/ErrorBoundary'
import { PlatformCode, PlayStatus } from '@gamepilot/types'

// Mock the stores
jest.mock('../../../stores/useLibraryStore', () => ({
  useLibraryStore: jest.fn(() => ({
    games: [],
    currentSession: null,
    actions: {
      addGame: jest.fn(),
      updateGame: jest.fn(),
      removeGame: jest.fn(),
      updateGameStatus: jest.fn(),
      updateGamePlaytime: jest.fn(),
      setIntelligenceState: jest.fn()
    }
  }))
}))

jest.mock('../../../stores/useGamePilotStore', () => ({
  __esModule: true,
  useGamePilotStore: jest.fn(() => ({
    integrations: {
      steam: { connected: false },
      discord: { connected: false },
      youtube: { connected: false }
    }
  }))
}))

describe('GameCard Component', () => {
  const mockGame = {
    id: '1',
    title: 'Test Game',
    coverImage: '/test-cover.jpg',
    genres: [
      { id: 'action', name: 'Action', color: '#FF6B6B', subgenres: [] },
      { id: 'rpg', name: 'RPG', color: '#10B981', subgenres: [] }
    ],
    subgenres: [],
    platforms: [
      { id: 'steam', name: 'Steam', code: PlatformCode.STEAM, isConnected: false }
    ],
    emotionalTags: [],
    playStatus: 'unplayed' as PlayStatus,
    hoursPlayed: 0,
    userRating: 0,
    isFavorite: false,
    tags: ['test', 'sample'],
    addedAt: new Date(),
    releaseYear: 2023
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render game card correctly', () => {
    const { useLibraryStore } = require('../../../stores/useLibraryStore')
    useLibraryStore.mockReturnValueOnce({
      games: [mockGame],
      currentSession: null,
      actions: {
        addGame: jest.fn(),
        updateGame: jest.fn(),
        removeGame: jest.fn(),
        updateGameStatus: jest.fn(),
        updateGamePlaytime: jest.fn(),
        setIntelligenceState: jest.fn()
      }
    })

    render(
      <PageErrorBoundary>
        <GameCard game={mockGame} />
      </PageErrorBoundary>
    )

    expect(screen.getByText('Test Game')).toBeInTheDocument()
    expect(screen.getByAltText('Test Game')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('RPG')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const { useLibraryStore } = require('../../../stores/useLibraryStore')
    const mockUpdateGameStatus = jest.fn()
    useLibraryStore.mockReturnValueOnce({
      games: [mockGame],
      currentSession: null,
      actions: {
        addGame: jest.fn(),
        updateGame: mockUpdateGameStatus,
        removeGame: jest.fn(),
        updateGameStatus: jest.fn(),
        updateGamePlaytime: jest.fn(),
        setIntelligenceState: jest.fn()
      }
    })

    render(
      <PageErrorBoundary>
        <GameCard game={mockGame} />
      </PageErrorBoundary>
    )

    const card = screen.getByTestId('game-card-1')
    
    // Test click on card
    fireEvent.click(card)
    
    // Should call updateGameStatus
    expect(mockUpdateGameStatus).toHaveBeenCalledWith('1', 'playing')
  })

  it('should display play status', () => {
    const { useLibraryStore } = require('../../../stores/useLibraryStore')
    useLibraryStore.mockReturnValueOnce({
      games: [mockGame],
      currentSession: null,
      actions: {
        addGame: jest.fn(),
        updateGame: jest.fn(),
        removeGame: jest.fn(),
        updateGameStatus: jest.fn(),
        updateGamePlaytime: jest.fn(),
        setIntelligenceState: jest.fn()
      }
    })

    render(
      <PageErrorBoundary>
        <GameCard game={mockGame} />
      </PageErrorBoundary>
    )

    expect(screen.getByText('Unplayed')).toBeInTheDocument()
  })

  it('should display hours played', () => {
    const { useLibraryStore } = require('../../../stores/useLibraryStore')
    useLibraryStore.mockReturnValueOnce({
      games: [mockGame],
      currentSession: null,
      actions: {
        addGame: jest.fn(),
        updateGame: jest.fn(),
        removeGame: jest.fn(),
        updateGameStatus: jest.fn(),
        updateGamePlaytime: jest.fn(),
        setIntelligenceState: jest.fn()
      }
    })

    render(
      <PageErrorBoundary>
        <GameCard game={mockGame} />
      </PageErrorBoundary>
    )

    expect(screen.getByText('0 hours played')).toBeInTheDocument()
  })

  it('should display rating', () => {
    const { useLibraryStore } = require('../../../stores/useLibraryStore')
    useLibraryStore.mockReturnValueOnce({
      games: [mockGame],
      currentSession: null,
      actions: {
        addGame: jest.fn(),
        updateGame: jest.fn(),
        removeGame: jest.fn(),
        updateGameStatus: jest.fn(),
        updateGamePlaytime: jest.fn(),
        setIntelligenceState: jest.fn()
      }
    })

    render(
      <PageErrorBoundary>
        <GameCard game={mockGame} />
      </PageErrorBoundary>
    )

    expect(screen.getByText('Not Rated')).toBeInTheDocument()
  })

  it('should display tags', () => {
    const { useLibraryStore } = require('../../../stores/useLibraryStore')
    useLibraryStore.mockReturnValueOnce({
      games: [mockGame],
      currentSession: null,
      actions: {
        addGame: jest.fn(),
        updateGame: jest.fn(),
        removeGame: jest.fn(),
        updateGameStatus: jest.fn(),
        updateGamePlaytime: jest.fn(),
        setIntelligenceState: jest.fn()
      }
    })

    render(
      <PageErrorBoundary>
        <GameCard game={mockGame} />
      </PageErrorBoundary>
    )

    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('sample')).toBeInTheDocument()
  })

  it('should display favorite status', () => {
    const { useLibraryStore } = require('../../../stores/useLibraryStore')
    useLibraryStore.mockReturnValueOnce({
      games: [mockGame],
      currentSession: null,
      actions: {
        addGame: jest.fn(),
        updateGame: jest.fn(),
        removeGame: jest.fn(),
        updateGameStatus: jest.fn(),
        updateGamePlaytime: jest.fn(),
        setIntelligenceState: jest.fn()
      }
    })

    render(
      <PageErrorBoundary>
        <GameCard game={mockGame} />
      </PageErrorBoundary>
    )

    expect(screen.getByText('Not Favorite')).toBeInTheDocument()
  })

  it('should be accessible', () => {
    const { useLibraryStore } = require('../../../stores/useLibraryStore')
    useLibraryStore.mockReturnValueOnce({
      games: [mockGame],
      currentSession: null,
      actions: {
        addGame: jest.fn(),
        updateGame: jest.fn(),
        removeGame: jest.fn(),
        updateGameStatus: jest.fn(),
        updateGamePlaytime: jest.fn(),
        setIntelligenceState: jest.fn()
      }
    })

    render(
      <PageErrorBoundary>
        <GameCard game={mockGame} />
      </PageErrorBoundary>
    )

    // Test keyboard navigation
    const card = screen.getByTestId('game-card-1')
    userEvent.tab(card)
    
    expect(card).toHaveFocus()
  })

  it('should handle loading state', () => {
    const { useLibraryStore } = require('../../../stores/useLibraryStore')
    useLibraryStore.mockReturnValueOnce({
      games: [mockGame],
      currentSession: null,
      actions: {
        addGame: jest.fn(),
        updateGame: jest.fn(),
        removeGame: jest.fn(),
        updateGameStatus: jest.fn(),
        updateGamePlaytime: jest.fn(),
        setIntelligenceState: jest.fn()
      }
    })

    render(
      <PageErrorBoundary>
        <GameCard game={mockGame} />
      </PageErrorBoundary>
    )

    expect(screen.getByText('Test Game')).toBeInTheDocument()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })
})
