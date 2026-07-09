'use client'

import { useState, useEffect } from 'react'
import { getNotifications, markNotificationsAsRead } from '@/app/actions/social'
import { X, Heart, MessageCircle, UserPlus, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'share'
  actionUserId: string
  actionUserName?: string
  targetId: string
  read: boolean
  createdAt: Date
}

const NOTIFICATION_CONFIG = {
  like: { icon: Heart, text: 'a aimé votre écho', color: 'text-ruby' },
  comment: { icon: MessageCircle, text: 'a commenté', color: 'text-cobalt' },
  follow: { icon: UserPlus, text: 'vous suit maintenant', color: 'text-jade' },
  share: { icon: Share2, text: 'a partagé votre contenu', color: 'text-gold' },
}

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
  initialUnreadCount?: number
}

export function NotificationsModal({ isOpen, onClose, initialUnreadCount = 0 }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await getNotifications(50)
      setNotifications(data as any[])
      
      // Mark all as read
      const unreadIds = data.filter(n => !n.read).map(n => n.id)
      if (unreadIds.length > 0) {
        await markNotificationsAsRead(unreadIds)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      <div className="fixed bottom-0 left-0 right-0 rounded-t-2xl bg-card border-t border-border max-w-md mx-auto animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">Notifications</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors">
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin inline-block size-6 border-2 border-jade border-r-transparent rounded-full" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Pas de nouvelles notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif) => {
                const config = NOTIFICATION_CONFIG[notif.type]
                const Icon = config.icon

                return (
                  <button
                    key={notif.id}
                    className="w-full p-4 hover:bg-secondary/50 transition-colors text-left flex items-start gap-3"
                  >
                    <div className={cn('flex-shrink-0 p-2 rounded-full bg-secondary', config.color)}>
                      <Icon className="size-4" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {notif.actionUserName || 'Quelqu\'un'} {config.text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="flex-shrink-0 size-2 rounded-full bg-jade mt-1.5" aria-label="Nouvelle notification" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
