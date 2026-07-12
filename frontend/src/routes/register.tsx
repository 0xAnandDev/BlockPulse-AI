import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Mail } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import Divider from '../components/auth/Divider'
import GoogleButton from '../components/auth/GoogleButton'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import PasswordInput from '../components/ui/PasswordInput'
import Checkbox from '../components/ui/Checkbox'
import { registerSchema, type RegisterFormValues } from '../lib/validation'
import { ApiError, registerUser } from '../lib/api/auth'

export const Route = createFileRoute('/register')({ component: RegisterPage })

function RegisterPage() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false as unknown as true,
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null)
    try {
      await registerUser({ fullName: values.fullName, email: values.email, password: values.password })
      navigate({ to: '/login' })
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Start monitoring your wallets and contracts in minutes."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[var(--cyan)] no-underline hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Full Name"
          type="text"
          autoComplete="name"
          icon={<User className="h-4 w-4" aria-hidden="true" />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          icon={<Mail className="h-4 w-4" aria-hidden="true" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordInput
          label="Password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordInput
          label="Confirm Password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Checkbox
          label={
            <>
              I agree to the{' '}
              <a href="/terms" className="text-[var(--cyan)] hover:underline">
                Terms
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-[var(--cyan)] hover:underline">
                Privacy Policy
              </a>
            </>
          }
          error={errors.agreeToTerms?.message}
          {...register('agreeToTerms')}
        />

        {formError && (
          <p role="alert" className="rounded-lg border border-[rgba(244,63,94,0.35)] bg-[rgba(244,63,94,0.1)] px-4 py-2.5 text-sm text-[var(--risk-high)]">
            {formError}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting || !isValid}>
          Create Account
        </Button>
      </form>

      <Divider />
      <GoogleButton />
    </AuthLayout>
  )
}
