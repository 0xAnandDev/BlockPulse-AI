import { forwardRef, useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string
  options: Array<SelectOption>
  error?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, label, options, error, id, ...props }, ref) => {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-[var(--ink-soft)]">
        {label}
      </label>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          className={cn(
            'w-full appearance-none rounded-xl border border-[var(--line)] bg-[rgba(10,14,24,0.6)] px-4 py-2.5 pr-10 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--cyan)] focus:ring-2 focus:ring-[rgba(34,211,238,0.18)]',
            error && 'border-[var(--risk-high)] focus:border-[var(--risk-high)] focus:ring-[rgba(244,63,94,0.18)]',
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[var(--bg-elevated)]">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p role="alert" className="text-xs font-medium text-[var(--risk-high)]">
          {error}
        </p>
      )}
    </div>
  )
})
Select.displayName = 'Select'

export default Select
