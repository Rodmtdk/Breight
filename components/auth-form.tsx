'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { LockKeyhole, Ear, Sparkles, ShieldCheck } from 'lucide-react'
import { triggerSensory } from '@/lib/sensory'

const PILLARS = [
  { icon: Ear, label: 'Écoute profonde', desc: 'Des vraies conversations' },
  { icon: Sparkles, label: 'Connexion vraie', desc: 'Des liens qui durent' },
  { icon: ShieldCheck, label: 'Chiffré E2E', desc: 'Tes mots t\'appartiennent' },
]

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = isSignUp
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message ?? 'Une erreur est survenue')
      return
    }

    triggerSensory('milestone')
    router.push('/')
    router.refresh()
  }

  return (
    <main className="min-h-svh bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm flex flex-col gap-7">

        {/* Brand header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center size-12 rounded-2xl bg-primary mb-1">
            <LockKeyhole className="size-5 text-primary-foreground" aria-hidden="true" />
          </div>
          <span className="text-3xl font-semibold tracking-tighter text-foreground">BREIGHT</span>
          <p className="text-sm text-muted-foreground text-balance leading-relaxed max-w-[22rem]">
            {isSignUp
              ? 'Crée ton compte en 10 secondes et commence à te connecter vraiment.'
              : 'Bon retour. Tes conversations t\'attendent.'}
          </p>
        </div>

        {/* Form card */}
        <Card className="p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Prénom</Label>
                <Input
                  id="name"
                  placeholder="Ton prénom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="given-name"
                  autoFocus
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="toi@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus={!isSignUp}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? 'Minimum 8 caractères' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/8 rounded-lg px-3 py-2" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full mt-1">
              {loading ? 'Un instant...' : isSignUp ? 'Créer mon compte' : 'Se connecter'}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-5">
            {isSignUp ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
            <Link
              href={isSignUp ? '/sign-in' : '/sign-up'}
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              {isSignUp ? 'Se connecter' : "S'inscrire"}
            </Link>
          </p>
        </Card>

        {/* 3 pillars — only on sign-up */}
        {isSignUp && (
          <div className="grid grid-cols-3 gap-3">
            {PILLARS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl bg-secondary p-3 text-center">
                <Icon className="size-4 text-warm" aria-hidden="true" />
                <span className="text-[11px] font-semibold text-foreground leading-tight">{label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{desc}</span>
              </div>
            ))}
          </div>
        )}

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <LockKeyhole className="size-3.5" aria-hidden="true" />
          {'Chiffrement E2E — tes messages ne quittent jamais ton appareil en clair'}
        </p>
      </div>
    </main>
  )
}
