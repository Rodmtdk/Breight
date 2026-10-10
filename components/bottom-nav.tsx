'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera, FolderOpen, Map, MessageCircle, Play, Radio, User, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { triggerSensory } from '@/lib/sensory'

const NAV_ITEMS = [
  { href: '/chat', label: 'Messages', icon: MessageCircle, badge: true },
  { href: '/discover', label: 'Amis', icon: Users },
  { href: '/', label: 'Caméra', icon: Camera, center: true },
  { href: '/feed', label: 'Stories', icon: Play },
  { href: '/map', label: 'Carte', icon: Map },
  { href: '/radar', label: 'Radar', icon: Radio },
  { href: '/profile', label: 'Profil', icon: User },
]

export function BottomNav({ unreadCount = 0, overlay = false }: { unreadCount?: number; overlay?: boolean }) {
  const pathname = usePathname()

  return (
    <>
      <Link
        href="/profile"
        aria-label="Ouvrir mon profil"
        onClick={() => triggerSensory('tap')}
        className={cn(
          'fixed left-4 z-[60] grid size-11 place-items-center rounded-full border shadow-xl backdrop-blur-xl transition-transform hover:scale-105 active:scale-95',
          'top-[max(1rem,env(safe-area-inset-top))]',
          overlay ? 'border-white/20 bg-black/45 text-white' : 'border-border/70 bg-card/90 text-foreground',
        )}
      >
        <User className="size-5" aria-hidden="true" />
        <span className="sr-only">Mon profil</span>
      </Link>
      <nav
      aria-label="Navigation principale"
      className={cn(
        'fixed bottom-0 inset-x-0 z-50 border-t shadow-[0_-10px_30px_-24px_currentColor]',
        overlay
          ? 'border-white/10 bg-black/55 text-white backdrop-blur-xl'
          : 'border-border/60 bg-card/96 text-foreground backdrop-blur-xl',
      )}
    >
      <div className="mx-auto flex max-w-2xl items-end justify-between gap-0.5 px-1.5 pt-1.5 pb-[max(0.55rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const Icon = item.icon
          const showBadge = item.badge && unreadCount > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => triggerSensory('tap')}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-h-14 flex-1 flex-col items-center justify-end gap-1 rounded-2xl pb-1 text-[10px] font-semibold transition-colors',
                overlay
                  ? active ? 'text-white' : 'text-white/65'
                  : active ? 'text-jade' : 'text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'relative grid place-items-center rounded-full transition-transform',
                  item.center ? 'size-12 -mt-5 shadow-lg' : 'size-9',
                  item.center && (overlay ? 'bg-white text-black ring-4 ring-white/10' : 'bg-jade text-jade-foreground ring-4 ring-jade/10'),
                  !item.center && active && (overlay ? 'bg-white/15' : 'bg-jade/10'),
                )}
              >
                <Icon className="size-5" strokeWidth={active || item.center ? 2.4 : 1.8} aria-hidden="true" />
                {showBadge ? (
                  <span className="absolute -top-1 -right-1 grid min-w-4 h-4 place-items-center rounded-full bg-ruby px-1 text-[9px] font-bold text-ruby-foreground">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
              </span>
              <span className={cn('leading-none', active && 'font-semibold')}>{item.label}</span>
            </Link>
          )
        })}
      </div>
      </nav>
    </>
  )
}
