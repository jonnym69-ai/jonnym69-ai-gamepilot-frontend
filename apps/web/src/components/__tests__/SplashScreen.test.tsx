import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SplashScreen } from '../SplashScreen'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    img: ({ ...props }: any) => <img {...props} />
  }
}))

describe('SplashScreen', () => {
  const mockOnComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the splash screen with GamePilot logo', () => {
    render(<SplashScreen onComplete={mockOnComplete} />)
    
    expect(screen.getByAltText('GamePilot')).toBeInTheDocument()
    expect(screen.getByText('GamePilot')).toBeInTheDocument()
    expect(screen.getByText('Your Gaming Journey Starts Here')).toBeInTheDocument()
  })

  it('calls onComplete after 1.8 seconds', async () => {
    render(<SplashScreen onComplete={mockOnComplete} />)
    
    expect(mockOnComplete).not.toHaveBeenCalled()
    
    // Fast-forward time
    vi.advanceTimersByTime(1800)
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1)
    })
  })

  it('shows skip button', () => {
    render(<SplashScreen onComplete={mockOnComplete} />)
    
    const skipButton = screen.getByText('Skip →')
    expect(skipButton).toBeInTheDocument()
  })

  it('calls onComplete when skip button is clicked', () => {
    render(<SplashScreen onComplete={mockOnComplete} />)
    
    const skipButton = screen.getByText('Skip →')
    skipButton.click()
    
    expect(mockOnComplete).toHaveBeenCalledTimes(1)
  })

  it('has proper accessibility attributes', () => {
    render(<SplashScreen onComplete={mockOnComplete} />)
    
    const logo = screen.getByAltText('GamePilot')
    expect(logo).toHaveAttribute('src', '/logo/a 3_4 angled disc lo.png')
  })
})
