'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, MessageCircle, Camera, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { triggerSensory } from '@/lib/sensory'

const NAV_ITEMS = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/discovery', label: 'Découvrir', icon: Compass },
  { href: '/chat', label: 'Messages', icon: MessageCircle, badge: true },
  { href: '/feed', label: 'Moments', icon: Camera },
  { href: '/profile', label: 'Profil', icon: User },
]

export function BottomNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
    >
      <div className="mx-auto max-w-lg flex items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const Icon = item.icon
          const showBadge = item.badge && unreadCount > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => triggerSensory('tap')}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors',
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
              aria-current={active ? 'page' : undefined}
            >
              {/* Icon container — filled background when active */}
              <span className="relative">
                <span
                  className={cn(
                    'flex items-center justify-center size-9 rounded-xl transition-all duration-150',
                    active ? 'bg-primary/8' : '',
                  )}
                >
                  <Icon
                    className={cn(
                      'size-5 transition-colors',
                      active ? 'text-primary' : 'text-muted-foreground',
                    )}
                    strokeWidth={active ? 2.2 : 1.8}
                    aria-hidden="true"
                  />
                </span>

                {/* Unread badge */}
                {showBadge && (
                  <span
                    className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-warm text-[9px] font-bold text-warm-foreground"
                    aria-label={`${unreadCount} messages non lus`}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>

              <span className={cn(active ? 'text-primary' : '')}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
