import React from 'react'
import { cn } from '../../utils/cn'

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  md?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  gap?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12
  autoFit?: boolean
  autoFill?: boolean
  cinematic?: boolean
  children: React.ReactNode
}

export const Grid: React.FC<GridProps> = ({
  cols,
  sm,
  md,
  lg,
  xl,
  gap = 6,
  autoFit = false,
  autoFill = false,
  cinematic = false,
  className,
  children,
  ...props
}) => {
  const getColsClass = (breakpoint?: number, prefix = '') => {
    if (!breakpoint) return ''
    return `${prefix}grid-cols-${breakpoint}`
  }

  const gridClasses = [
    cols && `grid-cols-${cols}`,
    sm && getColsClass(sm, 'sm:'),
    md && getColsClass(md, 'md:'),
    lg && getColsClass(lg, 'lg:'),
    xl && getColsClass(xl, 'xl:'),
    autoFit && 'grid-cols-[fit-content(minmax(250px,1fr))]',
    autoFill && 'grid-cols-[repeat(auto-fill,minmax(250px,1fr))]'
  ].filter(Boolean).join(' ')

  const gapClass = `gap-${gap}`
  const cinematicClass = cinematic ? 'backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10 p-6' : ''

  return (
    <div
      className={cn(
        'grid',
        gridClasses,
        gapClass,
        cinematicClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
