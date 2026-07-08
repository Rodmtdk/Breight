'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Users, MessageCircle, ArrowRight } from 'lucide-react'
import { triggerSensory } from '@/lib/sensory'

const TRUST_POINTS = [
  { icon: Users,         color: 'text-jade',   bg: 'bg-jade/10',   text: 'Rencontres basées sur les vraies affinités' },
  { icon: MessageCircle, color: 'text-cobalt',  bg: 'bg-cobalt/10', text: 'Conversations qui dépassent le superficiel' },
  { icon: ShieldCheck,   color: 'text-mauve',   bg: 'bg-mauve/10',  text: "Chiffrement E2E — tes mots t'appartiennent" },
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
    // New sign-ups go to onboarding; sign-ins go to dashboard
    router.push(isSignUp ? '/onboarding' : '/')
    router.refresh()
  }

  return (
    <main className="min-h-svh bg-background flex flex-col">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 py-5 max-w-lg mx-auto w-full">
        <Link href="/welcome" className="font-serif text-xl font-semibold tracking-tight text-foreground">
          Breight
        </Link>
        <Link
          href={isSignUp ? '/sign-in' : '/sign-up'}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isSignUp ? 'Déjà membre ?' : 'Pas de compte ?'}{' '}
          <span className="font-semibold text-foreground">
            {isSignUp ? 'Connexion' : "S'inscrire"}
          </span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col max-w-lg mx-auto w-full px-5 pt-6 pb-16 gap-9">

        {/* ── Headline ── */}
        <div>
          <h1 className="font-serif text-[2rem] font-semibold tracking-tight text-foreground text-balance leading-snug">
            {isSignUp ? 'Rejoins Breight' : 'Content de te revoir'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {isSignUp
              ? 'Crée ton compte gratuitement en quelques secondes.'
              : 'Reconnecte-toi pour reprendre tes conversations.'}
          </p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="text-[13px] font-medium text-foreground">Prénom</Label>
              <Input
                id="name"
                placeholder="Ton prénom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="given-name"
                autoFocus
                className="h-12 rounded-xl border-border/70 bg-card text-sm px-4 shadow-sm focus-visible:ring-jade/40"
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-[13px] font-medium text-foreground">Adresse email</Label>
            <Input
              id="email"
              type="email"
              placeholder="toi@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus={!isSignUp}
              className="h-12 rounded-xl border-border/70 bg-card text-sm px-4 shadow-sm focus-visible:ring-jade/40"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-[13px] font-medium text-foreground">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder={isSignUp ? 'Minimum 8 caractères' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="h-12 rounded-xl border-border/70 bg-card text-sm px-4 shadow-sm focus-visible:ring-jade/40"
            />
          </div>

          {error && (
            <p className="text-sm text-ruby bg-ruby/8 rounded-xl px-4 py-2.5 border border-ruby/15" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-13 text-base font-semibold rounded-2xl mt-1 shadow-md shadow-jade/15 gap-2"
          >
            {loading ? 'Un instant...' : isSignUp ? 'Créer mon compte' : 'Se connecter'}
            {!loading && <ArrowRight className="size-4" aria-hidden="true" />}
          </Button>
        </form>

        {/* ── Trust points — sign-up only ── */}
        {isSignUp && (
          <div className="flex flex-col gap-3 pt-5 border-t border-border/60">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Pourquoi Breight ?
            </p>
            {TRUST_POINTS.map(({ icon: Icon, color, bg, text }) => (
              <div key={text} className="flex items-center gap-3.5">
                <div className={`flex-shrink-0 flex items-center justify-center size-8 rounded-xl ${bg}`}>
                  <Icon className={`size-4 ${color}`} aria-hidden="true" />
                </div>
                <p className="text-sm text-muted-foreground leading-snug">{text}</p>
              </div>
            ))}
          </div>
        )}

        {isSignUp && (
          <p className="text-[11px] text-muted-foreground text-center -mt-4">
            En créant un compte tu acceptes nos{' '}
            <span className="underline underline-offset-2 cursor-pointer">conditions d&apos;utilisation</span>.
          </p>
        )}
      </div>
    </main>
  )
}
