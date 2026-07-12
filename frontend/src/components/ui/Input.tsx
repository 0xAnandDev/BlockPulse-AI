import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: ReactNode
  trailing?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, trailing, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--ink-soft)]">
          {label}
        </label>
        <div className="relative flex items-center">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 text-[var(--ink-faint)]">{icon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'w-full rounded-xl border border-[var(--line)] bg-[rgba(10,14,24,0.6)] px-4 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-faint)] focus:border-[var(--cyan)] focus:ring-2 focus:ring-[rgba(34,211,238,0.18)]',
              icon && 'pl-10',
              trailing && 'pr-10',
              error && 'border-[var(--risk-high)] focus:border-[var(--risk-high)] focus:ring-[rgba(244,63,94,0.18)]',
              className,
            )}
            {...props}
          />
          {trailing && <span className="absolute right-3.5 flex items-center">{trailing}</span>}
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium text-[var(--risk-high)]">
            {error}
          </p>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

export default Input
