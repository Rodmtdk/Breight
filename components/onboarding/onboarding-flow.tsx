'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertProfile } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { triggerSensory } from '@/lib/sensory'
import { cn } from '@/lib/utils'
import { BREIGHT } from '@/lib/breight-brand'
import { ArrowRight, Check, Sparkles, Users, ShieldCheck, Ear, Heart, Lock } from 'lucide-react'

const INTERESTS = [
  'Musique', 'Sport', 'Voyage', 'Cuisine', 'Gaming', 'Lecture',
  'Cinéma', 'Nature', 'Art', 'Tech', 'Photo', 'Danse',
  'Yoga', 'Méditation', 'Entrepreneuriat', 'Mode', 'Science', 'Podcast',
]

const STEPS = [
  { id: 1, label: 'Bienvenue', hint: 'Découvre la philosophie BREIGHT' },
  { id: 2, label: 'Qui tu es', hint: 'Quelques mots pour te présenter' },
  { id: 3, label: 'Tes passions', hint: 'Choisis au moins 3 centres d\'intérêt' },
  { id: 4, label: "C'est parti", hint: 'Tout est prêt' },
]

export function OnboardingFlow({ userName }: { userName: string }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState(userName)
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [age, setAge] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const toggleInterest = (i: string) => {
    triggerSensory('tap')
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    )
  }

  const handleFinish = async () => {
    if (saving) return
    setSaving(true)
    try {
      await upsertProfile({
        displayName: displayName.trim() || userName,
        bio: bio.trim() || undefined,
        age: age ? Number(age) : undefined,
        location: location.trim() || undefined,
        interests,
        isDiscoverable: true,
      })
      triggerSensory('milestone')
      router.push('/')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <main className="min-h-svh bg-background flex flex-col max-w-lg mx-auto px-5">

      {/* Top bar */}
      <div className="pt-10 pb-6">
        <div className="flex items-center gap-3 mb-5">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-500',
                step > s.id ? 'bg-primary' : step === s.id ? 'bg-primary/60' : 'bg-border',
              )}
              aria-hidden="true"
            />
          ))}
        </div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Étape {step} sur {STEPS.length} — {STEPS[step - 1].hint}
        </p>
      </div>

      {/* Step 1 — Welcome to Breight */}
      {step === 1 && (
        <div className="flex flex-1 flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-300 py-8">
          <div className="text-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground text-balance">
              Bienvenue dans BREIGHT
            </h1>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
              {BREIGHT.manifesto.subheading}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { icon: Ear, label: BREIGHT.principles[0].title, desc: BREIGHT.principles[0].description },
              { icon: Heart, label: BREIGHT.principles[3].title, desc: BREIGHT.principles[3].description },
              { icon: Lock, label: BREIGHT.principles[4].title, desc: BREIGHT.principles[4].description },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl bg-card border border-border p-4">
                <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-jade/10">
                  <Icon className="size-5 text-jade" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            className="w-full h-12 text-base mt-auto"
            onClick={() => { triggerSensory('tap'); setStep(2) }}
          >
            Découvrir
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      )}

      {/* Step 2 — Identity */}
      {step === 2 && (
        <div className="flex flex-1 flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground text-balance">
              Bonjour, {userName.split(' ')[0] || 'toi'}.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Quelques informations pour que les bonnes personnes te trouvent.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="displayName">Comment tu veux qu&apos;on t&apos;appelle ?</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ton prénom ou pseudo"
                className="h-12"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="age">Âge</Label>
                <Input
                  id="age"
                  type="number"
                  min={13}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  className="h-12"
                />
              </div>
              <div className="flex flex-[2] flex-col gap-1.5">
                <Label htmlFor="location">Ville</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Paris, Montréal..."
                  className="h-12"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bio">En quelques mots, qui es-tu ?</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Passionné(e) de... Je cherche..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <div className="mt-auto pb-10">
            <Button
              className="w-full h-12 text-base"
              disabled={!displayName.trim()}
            onClick={() => { triggerSensory('tap'); setStep(3) }}
            >
              Continuer
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Interests */}
      {step === 3 && (
        <div className="flex flex-1 flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground text-balance">
              Tes centres d&apos;intérêt
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Choisis au moins 3. Ils permettent de te connecter avec des personnes qui te ressemblent vraiment.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {INTERESTS.map((interest) => {
              const selected = interests.includes(interest)
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                    selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary/40',
                  )}
                  aria-pressed={selected}
                >
                  {selected && <Check className="size-3.5" aria-hidden="true" />}
                  {interest}
                </button>
              )
            })}
          </div>

          <div className="mt-auto pb-10 flex flex-col gap-3">
            {interests.length > 0 && (
              <p className="text-center text-xs text-muted-foreground">
                {interests.length} sélectionné{interests.length > 1 ? 's' : ''}
              </p>
            )}
            <Button
              className="w-full h-12 text-base"
              disabled={interests.length < 3}
              onClick={() => { triggerSensory('tap'); setStep(4) }}
            >
              Continuer
              <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setStep(1)}>
              Retour
            </Button>
          </div>
        </div>
      )}

      {/* Step 4 — Launch */}
      {step === 4 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 py-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground text-balance">
              Tout est prêt, {displayName.split(' ')[0]} !
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Bienvenue dans BREIGHT. Des connexions vraies t&apos;attendent.
            </p>
          </div>

          {/* 3 features recap */}
          <div className="w-full flex flex-col gap-3">
            {[
              { icon: Users, color: 'text-jade', bg: 'bg-jade/10', title: 'Découverte', desc: 'Rencontre des personnes par affinités' },
              { icon: Sparkles, color: 'text-mauve', bg: 'bg-mauve/10', title: 'Conversations profondes', desc: 'Des prompts pour aller au-delà du superficiel' },
              { icon: ShieldCheck, color: 'text-cobalt', bg: 'bg-cobalt/10', title: 'Chiffrement E2E', desc: 'Tes messages t\'appartiennent entièrement' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="flex items-center gap-4 rounded-2xl bg-card border border-border p-4">
                <div className={cn('flex size-10 flex-shrink-0 items-center justify-center rounded-xl', bg)}>
                  <Icon className={cn('size-5', color)} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full flex flex-col gap-3">
            <Button
              className="w-full h-12 text-base"
              onClick={handleFinish}
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : 'Entrer dans BREIGHT'}
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
