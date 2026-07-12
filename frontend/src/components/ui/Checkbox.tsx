import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  error?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="flex cursor-pointer items-start gap-2.5 text-sm text-[var(--ink-soft)]">
          <span className="relative mt-0.5 inline-flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center">
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              aria-invalid={Boolean(error)}
              className={cn(
                'peer h-[18px] w-[18px] flex-shrink-0 appearance-none rounded-[5px] border border-[var(--line-strong)] bg-[rgba(10,14,24,0.6)] transition checked:border-[var(--cyan)] checked:bg-[var(--cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cyan)]',
                error && 'border-[var(--risk-high)]',
                className,
              )}
              {...props}
            />
            <Check
              className="pointer-events-none absolute h-3 w-3 text-[var(--bg)] opacity-0 peer-checked:opacity-100"
              aria-hidden="true"
            />
          </span>
          <span>{label}</span>
        </label>
        {error && (
          <p role="alert" className="pl-7 text-xs font-medium text-[var(--risk-high)]">
            {error}
          </p>
        )}
      </div>
    )
  },
)
Checkbox.displayName = 'Checkbox'

export default Checkbox
