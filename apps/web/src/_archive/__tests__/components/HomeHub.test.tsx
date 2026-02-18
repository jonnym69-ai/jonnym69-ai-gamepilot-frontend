import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomeHub } from '../../features/home/HomeHubFinal'
import { PageErrorBoundary } from '../../components/ErrorBoundary'

// Mock the stores
jest.mock('../../stores/useLibraryStore', () => ({
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

jest.mock('../../stores/useGamePilotStore', () => ({
  useGamePilotStore: jest.fn(() => ({
    integrations: {
      steam: { connected: false },
      discord: { connected: false },
      youtube: { connected: false }
    },
  }))
}))

jest.mock('../../store/authStore', () => ({
  useAuthStore: jest.fn(() => ({
    user: {
      id: '1',
      username: 'testuser',
      displayName: 'Test User',
      avatar: 'test-avatar.jpg'
    },
    isAuthenticated: true,
    isLoading: false,
    error: null
  }))
}))

describe('HomeHub Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(
      <PageErrorBoundary>
        <HomeHub />
      </PageErrorBoundary>
    )

    expect(screen.getByText('Welcome back, Gamer')).toBeInTheDocument()
    expect(screen.getByText('Your gaming universe at a glance')).toBeInTheDocument()
  })

  it('should display integrations section', () => {
    render(
      <PageErrorBoundary>
        <HomeHub />
      </PageErrorBoundary>
    )

    expect(screen.getByText('Integrations')).toBeInTheDocument()
    expect(screen.getByText('Steam')).toBeInTheDocument()
    expect(screen.getByText('Discord')).toBeInTheDocument()
    expect(screen.getByText('YouTube')).toBeInTheDocument()
    expect(screen.getByText('Twitch')).toBeInTheDocument()
  })

  it('should display recently played section', () => {
    render(
      <PageErrorBoundary>
        <HomeHub />
      </PageErrorBoundary>
    )

    expect(screen.getByText('Recently Played')).toBeInTheDocument()
    expect(screen.getByText('No recently played games yet. Start playing some games to see them here!')).toBeInTheDocument()
  })

  it('should display recommendations section', () => {
    render(
      <PageErrorBoundary>
        <HomeHub />
      </PageErrorBoundary>
    )

    expect(screen.getByText('Recommended for You')).toBeInTheDocument()
    expect(screen.getByText('Try something atmospheric')).toBeInTheDocument()
    expect(screen.getByText('Games with strong narrative')).toBeInTheDocument()
    expect(screen.getByText('Fast-paced action picks')).toBeInTheDocument()
  })

  it('should handle empty user data gracefully', () => {
    const { useAuthStore } = require('../../store/authStore')
    useAuthStore.mockReturnValueOnce({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })

    render(
      <PageErrorBoundary>
        <HomeHub />
      </PageErrorBoundary>
    )

    expect(screen.getByText('Welcome back, Gamer')).toBeInTheDocument()
    expect(screen.getByText('Your gaming universe at a glance')).toBeInTheDocument()
  })

  it('should handle empty games data gracefully', () => {
    const { useLibraryStore } = require('../../stores/useLibraryStore')
    useLibraryStore.mockReturnValueOnce({
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
    })

    render(
      <PageErrorBoundary>
        <HomeHub />
      </PageErrorBoundary>
    )

    expect(screen.getByText('No recently played games yet. Start playing some games to see them here!')).toBeInTheDocument()
  })

  it('should handle loading states', async () => {
    const { useAuthStore } = require('../../store/authStore')
    useAuthStore.mockReturnValueOnce({
      user: null,
      isAuthenticated: true,
      isLoading: true,
      error: null
    })

    render(
      <PageErrorBoundary>
        <HomeHub />
      </PageErrorBoundary>
    )

    expect(screen.getByText('Loading your dashboard…')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.queryByText('Loading your dashboard…')).not.toBeInTheDocument()
      expect(screen.getByText('Welcome back, Gamer')).toBeInTheDocument()
    })
  })

  it('should handle error states', () => {
    const { useAuthStore } = require('../../store/authStore')
    useAuthStore.mockReturnValueOnce({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Failed to load user data'
    })

    render(
      <PageErrorBoundary>
        <HomeHub />
      </PageErrorBoundary>
    )

    expect(screen.getByText('Home Hub Error')).toBeInTheDocument()
    expect(screen.getByText('Failed to load user data')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('should be accessible', () => {
    render(
      <PageErrorBoundary>
        <HomeHub />
      </PageErrorBoundary>
    )

    // Test keyboard navigation
    const user = screen.getByRole('button', { name: /integrations/i })
    userEvent.tab(user)
    
    expect(screen.getByRole('button', { name: /recently played/i })).toBeInTheDocument()
    userEvent.tab(screen.getByRole('button', { name: /recommended/i }))
    
    // Test ARIA labels
    expect(screen.getByLabelText('Steam integration')).toBeInTheDocument()
    expect(screen.getByLabelText('Discord integration')).toBeInTheDocument()
    expect(screen.getByLabelText('YouTube integration')).toBeInTheDocument()
  })

  it('should be responsive', () => {
    // Test mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      value: 375,
      configurable: true
    })

    render(
      <PageErrorBoundary>
        <HomeHub />
      </PageErrorBoundary>
    )

    // Should adapt layout for mobile
    expect(screen.getByText('Integrations')).toBeInTheDocument()
    expect(screen.getByText('Steam')).toBeInTheDocument()
  })
})
