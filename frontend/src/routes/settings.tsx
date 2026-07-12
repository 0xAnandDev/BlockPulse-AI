import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { KeyRound, Settings as SettingsIcon, ShieldCheck, User } from 'lucide-react'
import AppShell from '../components/dashboard/AppShell'
import Input from '../components/ui/Input'
import Checkbox from '../components/ui/Checkbox'
import Button from '../components/ui/Button'
import { getCachedUser, loadCurrentUser } from '../lib/api/currentUser'
import type { AuthUser } from '../lib/api/auth'

export const Route = createFileRoute('/settings')({ component: SettingsRoute })

function SettingsRoute() {
  const [user, setUser] = useState<AuthUser | null>(getCachedUser())

  useEffect(() => {
    if (user) return
    let cancelled = false
    loadCurrentUser()
      .then((u) => {
        if (!cancelled) setUser(u)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <AppShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-[var(--cyan)]" aria-hidden="true" />
          <div>
            <p className="kicker mb-0.5">Settings</p>
            <h1 className="display-title text-xl font-bold text-[var(--ink)]">Account &amp; preferences</h1>
          </div>
        </div>

        <section className="panel rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--ink-faint)]" aria-hidden="true" />
            <h2 className="font-semibold text-[var(--ink)]">Profile</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input key={user?.fullName} label="Full Name" defaultValue={user?.fullName ?? ''} />
            <Input key={user?.email} label="Email Address" type="email" defaultValue={user?.email ?? ''} disabled />
          </div>
          <Button className="mt-5 w-auto px-6">Save changes</Button>
        </section>

        <section className="panel rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--ink-faint)]" aria-hidden="true" />
            <h2 className="font-semibold text-[var(--ink)]">Alert preferences</h2>
          </div>
          <div className="flex flex-col gap-3">
            <Checkbox label="Notify me on high and critical risk alerts" defaultChecked />
            <Checkbox label="Notify me on new token approvals" defaultChecked />
            <Checkbox label="Weekly protection summary email" defaultChecked />
          </div>
        </section>

        <section className="panel rounded-2xl p-6">
          <div className="mb-5 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-[var(--ink-faint)]" aria-hidden="true" />
            <h2 className="font-semibold text-[var(--ink)]">Security</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="New Password" type="password" placeholder="••••••••" />
            <Input label="Confirm New Password" type="password" placeholder="••••••••" />
          </div>
          <Button variant="secondary" className="mt-5 w-auto px-6">
            Update password
          </Button>
        </section>
      </div>
    </AppShell>
  )
}
