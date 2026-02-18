import { render, screen } from '@testing-library/react'
import React from 'react'
// import { PageErrorBoundary } from '../../components/ErrorBoundary'

// Simple test to verify Jest setup
describe('Jest Setup Test', () => {
  it('should render without crashing', () => {
    render(
      React.createElement('div', {}, 'Test Component')
    )

    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })

  it('should have access to testing library', () => {
    expect(screen).toBeInTheDocument()
  })
})
