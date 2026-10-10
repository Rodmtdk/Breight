'use client'

import Link from 'next/link'
import { Bell, ChevronRight, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Br8DynamicIsland({ overlay = false, unreadCount = 0 }: { overlay?: boolean; unreadCount?: number }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[70] flex justify-center px-4">
      <div className={cn('pointer-events-auto group flex items-center gap-1 rounded-full border p-1.5 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] hover:px-2', overlay ? 'border-white/15 bg-black/45 text-white shadow-black/25' : 'border-white/35 bg-card/75 text-foreground shadow-black/10')}>
        <Link href="/profile" aria-label="Ouvrir mon profil" className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-gold via-ruby to-cobalt text-white transition-transform hover:scale-105">
          <User className="size-4" aria-hidden="true" />
        </Link>
        <div className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:max-w-44 group-hover:px-2 group-hover:opacity-100">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">BR8 maintenant</p>
          <p className="text-xs font-semibold">Ton espace est vivant</p>
        </div>
        <Link href="/chat" aria-label={unreadCount ? `${unreadCount} messages non lus` : 'Ouvrir les messages'} className="relative grid size-9 place-items-center rounded-full bg-foreground/10 transition-colors hover:bg-foreground/15">
          <Bell className="size-4" aria-hidden="true" />
          {unreadCount > 0 ? <span className="absolute right-0.5 top-0.5 size-2 rounded-full bg-ruby ring-2 ring-background" /> : null}
        </Link>
        <ChevronRight className="mr-1 size-3 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
    </div>
  )
}
