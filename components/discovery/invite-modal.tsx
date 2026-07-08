'use client'

import { useState } from 'react'
import { inviteByEmail } from '@/app/actions/discovery'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { triggerSensory } from '@/lib/sensory'
import { cn } from '@/lib/utils'
import { X, UserPlus, Check, Heart, Users } from 'lucide-react'

interface InviteModalProps {
  onClose: () => void
}

const TYPES = [
  { id: 'friend', label: 'Ami(e)', icon: Users, color: 'text-jade', bg: 'bg-jade/10', border: 'border-jade' },
  { id: 'couple', label: 'Partenaire', icon: Heart, color: 'text-ruby', bg: 'bg-ruby/10', border: 'border-ruby' },
] as const

export function InviteModal({ onClose }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [type, setType] = useState<'friend' | 'couple'>('friend')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || loading) return
    setLoading(true)
    setResult(null)
    try {
      const res = await inviteByEmail(email.trim(), type)
      if (res.ok) {
        triggerSensory('milestone')
        setResult({ ok: true, message: `Connexion envoyée ! Vous pouvez maintenant discuter.` })
      } else {
        setResult({ ok: false, message: res.error ?? 'Une erreur est survenue.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm px-0 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Inviter directement"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-card border border-border shadow-2xl pb-safe-area-inset-bottom">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <UserPlus className="size-4 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Inviter directement</h2>
              <p className="text-xs text-muted-foreground">Quelqu&apos;un que tu connais déjà</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-6 pb-8 flex flex-col gap-5">

          {/* Type selector */}
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map(({ id, label, icon: Icon, color, bg, border }) => (
              <button
                key={id}
                type="button"
                onClick={() => setType(id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-2xl border-2 p-3.5 text-left transition-all',
                  type === id
                    ? `${border} ${bg}`
                    : 'border-border bg-secondary/50 hover:border-border/80',
                )}
                aria-pressed={type === id}
              >
                <Icon className={cn('size-4', type === id ? color : 'text-muted-foreground')} aria-hidden="true" />
                <span className={cn('text-sm font-medium', type === id ? 'text-foreground' : 'text-muted-foreground')}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Email */}
          {!result?.ok && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invite-email">Email de la personne</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="ami@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="h-12"
                />
              </div>

              {result && !result.ok && (
                <p className="text-sm text-ruby bg-ruby/8 rounded-xl px-4 py-2.5 border border-ruby/15" role="alert">
                  {result.message}
                </p>
              )}

              <Button type="submit" disabled={loading || !email.trim()} className="h-12 w-full">
                {loading ? 'Envoi...' : 'Envoyer l\'invitation'}
              </Button>
            </form>
          )}

          {/* Success state */}
          {result?.ok && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-jade/10">
                <Check className="size-7 text-jade" aria-hidden="true" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.message}</p>
              <Button onClick={onClose} className="w-full h-12">
                Voir mes conversations
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
