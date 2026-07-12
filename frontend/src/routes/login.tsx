import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import Divider from '../components/auth/Divider'
import GoogleButton from '../components/auth/GoogleButton'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import PasswordInput from '../components/ui/PasswordInput'
import Checkbox from '../components/ui/Checkbox'
import { loginSchema, type LoginFormValues } from '../lib/validation'
import { ApiError, loginUser } from '../lib/api/auth'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null)
    try {
      await loginUser({ email: values.email, password: values.password })
      navigate({ to: '/dashboard' })
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Login to BlockPulse AI"
      subtitle="Pick up right where your monitoring left off."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-[var(--cyan)] no-underline hover:underline">
            Register
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          icon={<Mail className="h-4 w-4" aria-hidden="true" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordInput
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <Checkbox label="Remember me" {...register('rememberMe')} />
          <Link to="/forgot-password" className="text-sm font-medium text-[var(--cyan)] no-underline hover:underline">
            Forgot password?
          </Link>
        </div>

        {formError && (
          <p role="alert" className="rounded-lg border border-[rgba(244,63,94,0.35)] bg-[rgba(244,63,94,0.1)] px-4 py-2.5 text-sm text-[var(--risk-high)]">
            {formError}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting || !isValid}>
          Login
        </Button>
      </form>

      <Divider />
      <GoogleButton />
    </AuthLayout>
  )
}
