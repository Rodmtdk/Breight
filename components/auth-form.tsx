'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Users, MessageCircle } from 'lucide-react'
import { triggerSensory } from '@/lib/sensory'

const TRUST_POINTS = [
  { icon: Users, text: 'Rencontres basées sur les vraies affinités' },
  { icon: MessageCircle, text: 'Conversations qui dépassent le superficiel' },
  { icon: ShieldCheck, text: 'Chiffrement E2E — tes mots t\'appartiennent' },
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
    <main className="min-h-svh bg-background flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 max-w-lg mx-auto w-full">
        <Link href="/welcome" className="text-lg font-semibold tracking-tight text-foreground">
          BREIGHT
        </Link>
        <Link
          href={isSignUp ? '/sign-in' : '/sign-up'}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isSignUp ? 'Déjà membre ?' : 'Pas de compte ?'}{' '}
          <span className="font-semibold text-foreground underline-offset-4 hover:underline">
            {isSignUp ? 'Connexion' : "S'inscrire"}
          </span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col max-w-lg mx-auto w-full px-5 pt-8 pb-16 gap-8">

        {/* Headline */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground text-balance leading-snug">
            {isSignUp ? 'Rejoins BREIGHT' : 'Content de te revoir'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {isSignUp
              ? 'Crée ton compte gratuitement en quelques secondes.'
              : 'Connecte-toi pour reprendre tes conversations.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Prénom</Label>
              <Input
                id="name"
                placeholder="Ton prénom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="given-name"
                autoFocus
                className="h-11"
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              placeholder="toi@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus={!isSignUp}
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5">
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
              className="h-11"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/8 rounded-lg px-3 py-2.5" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full h-12 text-base mt-1">
            {loading ? 'Un instant...' : isSignUp ? 'Créer mon compte' : 'Se connecter'}
          </Button>
        </form>

        {/* Trust points — sign-up only */}
        {isSignUp && (
          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Pourquoi BREIGHT ?
            </p>
            {TRUST_POINTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex-shrink-0 flex items-center justify-center size-7 rounded-lg bg-warm/10">
                  <Icon className="size-3.5 text-warm" aria-hidden="true" />
                </div>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer legal */}
        {isSignUp && (
          <p className="text-xs text-muted-foreground text-center">
            En créant un compte tu acceptes nos{' '}
            <span className="underline underline-offset-2 cursor-pointer">conditions d&apos;utilisation</span>.
          </p>
        )}
      </div>
    </main>
  )
}
