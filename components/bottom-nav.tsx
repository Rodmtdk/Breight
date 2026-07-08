'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, MessageCircle, Camera, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { triggerSensory } from '@/lib/sensory'

const NAV_ITEMS = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/discovery', label: 'Découvrir', icon: Compass },
  { href: '/chat', label: 'Messages', icon: MessageCircle },
  { href: '/feed', label: 'Moments', icon: Camera },
  { href: '/profile', label: 'Profil', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
    >
      <div className="mx-auto max-w-lg flex items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => triggerSensory('tap')}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                active ? 'text-warm' : 'text-muted-foreground hover:text-foreground',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
