import { forwardRef, useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import Input from './Input'
import type { InputProps } from './Input'

const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'icon' | 'trailing'>>(
  (props, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        icon={<Lock className="h-4 w-4" aria-hidden="true" />}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="text-[var(--ink-faint)] transition hover:text-[var(--ink)]"
            aria-label={visible ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        {...props}
      />
    )
  },
)
PasswordInput.displayName = 'PasswordInput'

export default PasswordInput
