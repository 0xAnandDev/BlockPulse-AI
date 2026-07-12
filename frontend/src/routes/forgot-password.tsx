import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Mail } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export const Route = createFileRoute('/forgot-password')({ component: ForgotPasswordPage })

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to reset it."
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-[var(--cyan)] no-underline hover:underline">
            Back to login
          </Link>
        </>
      }
    >
      {sent ? (
        <p className="rounded-lg border border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.08)] px-4 py-3 text-sm text-[var(--ink)]">
          If an account exists for that email, a reset link is on its way.
        </p>
      ) : (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
          noValidate
        >
          <Input label="Email" type="email" autoComplete="email" icon={<Mail className="h-4 w-4" aria-hidden="true" />} required />
          <Button type="submit">Send reset link</Button>
        </form>
      )}
    </AuthLayout>
  )
}
