'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { InviteModal } from '@/components/discovery/invite-modal'

export function DiscoveryHeader() {
  const [showInvite, setShowInvite] = useState(false)

  return (
    <>
      <header className="flex items-start justify-between px-5 pt-8 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            D&eacute;couvrir
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Rencontre des personnes qui partagent tes int&eacute;r&ecirc;ts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-1.5 rounded-full bg-secondary border border-border px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors mt-1"
          aria-label="Inviter directement un ami"
        >
          <UserPlus className="size-3.5 text-primary" aria-hidden="true" />
          Inviter
        </button>
      </header>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </>
  )
}
