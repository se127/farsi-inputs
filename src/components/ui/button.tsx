import type { ComponentPropsWithRef } from 'react'
import { cn } from './cn'

type ButtonVariant = 'outline' | 'ghost' | 'solid'
type ButtonSize = 'icon' | 'sm' | 'md'

export type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-900'

const variants: Record<ButtonVariant, string> = {
  outline:
    'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
  ghost:
    'text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-700',
  solid:
    'bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200',
}

const sizes: Record<ButtonSize, string> = {
  icon: 'h-8 w-8',
  sm: 'h-8 px-3',
  md: 'h-9 px-4',
}

export function Button({
  className,
  variant = 'outline',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
}
