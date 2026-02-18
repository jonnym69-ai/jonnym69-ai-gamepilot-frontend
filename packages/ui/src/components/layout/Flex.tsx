import React from 'react'
import { cn } from '../../utils/cn'

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline'
  gap?: 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16
  items?: 'start' | 'end' | 'center' | 'stretch' | 'baseline'
  self?: 'start' | 'end' | 'center' | 'stretch' | 'baseline'
  cinematic?: boolean
  children: React.ReactNode
}

export const Flex: React.FC<FlexProps> = ({
  direction = 'row',
  wrap = 'nowrap',
  justify = 'start',
  align = 'stretch',
  gap = 0,
  items,
  self,
  cinematic = false,
  className,
  children,
  ...props
}) => {
  const directionClass = `flex-${direction}`
  const wrapClass = wrap !== 'nowrap' ? `flex-${wrap}` : ''
  const justifyClass = justify !== 'start' ? `justify-${justify}` : ''
  const alignClass = align !== 'stretch' ? `items-${align}` : ''
  const itemsClass = items ? `items-${items}` : ''
  const selfClass = self ? `self-${self}` : ''
  const gapClass = gap > 0 ? `gap-${gap}` : ''
  const cinematicClass = cinematic ? 'backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10 p-6' : ''

  return (
    <div
      className={cn(
        'flex',
        directionClass,
        wrapClass,
        justifyClass,
        alignClass,
        itemsClass,
        selfClass,
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
