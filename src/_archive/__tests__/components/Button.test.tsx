// Unit tests for Button component
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { Button } from '../../components/ui/Button'

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Click me')
  })

  it('should apply primary variant styles', () => {
    render(<Button variant="primary">Primary Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn-primary')
  })

  it('should apply secondary variant styles', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn-secondary')
  })

  it('should apply small size styles', () => {
    render(<Button size="small">Small Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn-small')
  })

  it('should apply medium size styles', () => {
    render(<Button size="medium">Medium Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn-medium')
  })

  it('should apply large size styles', () => {
    render(<Button size="large">Large Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn-large')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should not be disabled when disabled prop is false', () => {
    render(<Button disabled={false}>Enabled Button</Button>)
    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled()
  })

  it('should call onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick handler when disabled', () => {
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should render as button element by default', () => {
    render(<Button>Button</Button>)
    const button = screen.getByRole('button')
    expect(button.tagName).toBe('BUTTON')
  })

  it('should render as link element when href is provided', () => {
    render(<Button href="https://example.com">Link</Button>)
    const link = screen.getByRole('link')
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('should apply aria-label when provided', () => {
    render(<Button ariaLabel="Custom label">Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Custom label')
  })

  it('should apply aria-describedby when provided', () => {
    render(<Button ariaDescribedBy="description-id">Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-describedby', 'description-id')
  })

  it('should have proper focus management', () => {
    render(<Button>Focusable Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('tabIndex', '0')
  })

  it('should have proper keyboard accessibility', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Keyboard Button</Button>)
    const button = screen.getByRole('button')
    
    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    expect(handleClick).toHaveBeenCalledTimes(1)
    
    // Test Space key
    fireEvent.keyDown(button, { key: ' ', code: 'Space' })
    expect(handleClick).toHaveBeenCalledTimes(2)
  })

  it('should have proper ARIA attributes for disabled state', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })

  it('should have proper type attribute for button', () => {
    render(<Button type="submit">Submit Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('should have proper type attribute for reset', () => {
    render(<Button type="reset">Reset Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'reset')
  })

  it('should have proper type attribute for button default', () => {
    render(<Button>Default Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('should render children correctly', () => {
    render(
      <Button>
        <span data-testid="child">Child Element</span>
      </Button>
    )
    const child = screen.getByTestId('child')
    expect(child).toBeInTheDocument()
    expect(child).toHaveTextContent('Child Element')
  })

  it('should handle multiple click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Multi Click</Button>)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(3)
  })

  it('should have proper hover states', () => {
    render(<Button>Hover Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:scale-105')
  })

  it('should have proper focus states', () => {
    render(<Button>Focus Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('focus:outline-none')
    expect(button).toHaveClass('focus:ring-2')
  })

  it('should have proper active states', () => {
    render(<Button>Active Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('active:scale-95')
  })

  it('should have proper transition classes', () => {
    render(<Button>Transition Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('transition-all')
    expect(button).toHaveClass('duration-200')
  })
})
