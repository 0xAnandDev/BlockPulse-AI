import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  isLoading?: boolean
}

const VARIANT_CLASS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[linear-gradient(90deg,var(--indigo),var(--cyan))] text-white shadow-[0_12px_30px_rgba(99,102,241,0.35)] hover:-translate-y-0.5',
  secondary:
    'border border-[var(--line-strong)] bg-white/5 text-[var(--ink)] hover:-translate-y-0.5 hover:border-[var(--cyan)]',
  ghost: 'text-[var(--ink-soft)] hover:text-[var(--ink)]',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold no-underline transition disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0',
          VARIANT_CLASS[variant],
          className,
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'

export default Button
