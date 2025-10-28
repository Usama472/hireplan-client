import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: '',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ size }), className)}
    {...props}
  />
))
Card.displayName = 'Card'

const cardHeaderVariants = cva(
  'flex flex-col space-y-1.5',
  {
    variants: {
      size: {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardHeaderVariants>
>(({ className, size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardHeaderVariants({ size }), className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const cardTitleVariants = cva(
  'font-semibold leading-none tracking-tight',
  {
    variants: {
      size: {
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardTitleVariants>
>(({ className, size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardTitleVariants({ size }), className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const cardContentVariants = cva(
  '',
  {
    variants: {
      size: {
        sm: 'p-3 pt-0',
        md: 'p-4 pt-0',
        lg: 'p-5 pt-0',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardContentVariants>
>(({ className, size, ...props }, ref) => (
  <div ref={ref} className={cn(cardContentVariants({ size }), className)} {...props} />
))
CardContent.displayName = 'CardContent'

const cardFooterVariants = cva(
  'flex items-center',
  {
    variants: {
      size: {
        sm: 'p-3 pt-0',
        md: 'p-4 pt-0',
        lg: 'p-5 pt-0',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardFooterVariants>
>(({ className, size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardFooterVariants({ size }), className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
