'use client'

import { useState } from 'react'
import { toggleReaction, getReactionCount, getUserReaction } from '@/app/actions/social'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const REACTION_EMOJIS = [
  { emoji: 'heart', label: 'Like', icon: Heart },
  { emoji: 'fire', label: 'Fire', text: '🔥' },
  { emoji: 'light', label: 'Light', text: '💡' },
  { emoji: 'smile', label: 'Smile', text: '😊' },
  { emoji: 'pray', label: 'Pray', text: '🙏' },
]

interface EchoEngagementProps {
  echoId: string
  initialReactionCount?: number
  showComments?: boolean
}

export function EchoEngagement({ echoId, initialReactionCount = 0, showComments = true }: EchoEngagementProps) {
  const [reactionCount, setReactionCount] = useState(initialReactionCount)
  const [userReaction, setUserReaction] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showReactions, setShowReactions] = useState(false)

  const handleReact = async (emoji: string) => {
    setLoading(true)
    try {
      await toggleReaction(echoId, emoji)
      
      // Optimistic update
      if (userReaction === emoji) {
        setUserReaction(null)
        setReactionCount(Math.max(0, reactionCount - 1))
      } else {
        setUserReaction(emoji)
        setReactionCount(reactionCount + (userReaction ? 0 : 1))
      }
    } finally {
      setLoading(false)
      setShowReactions(false)
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg bg-secondary/30 border border-border p-3">
      {/* Reactions Picker */}
      <div className="relative flex items-center gap-1">
        <button
          onClick={() => setShowReactions(!showReactions)}
          disabled={loading}
          className="flex items-center gap-1 rounded-full px-2 py-1 hover:bg-secondary transition-colors"
        >
          <Heart
            className={cn('size-4', userReaction ? 'fill-jade text-jade' : 'text-muted-foreground')}
            aria-hidden="true"
          />
          {reactionCount > 0 && <span className="text-xs font-semibold text-foreground">{reactionCount}</span>}
        </button>

        {/* Emoji Selector */}
        {showReactions && (
          <div className="absolute left-0 top-full mt-2 flex gap-2 rounded-lg bg-card border border-border p-2 z-10 shadow-lg">
            {REACTION_EMOJIS.map(({ emoji, label, icon: Icon, text }) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                disabled={loading}
                title={label}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                {text || <Icon className="size-4" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comments & Share */}
      {showComments && (
        <div className="flex items-center gap-1">
          <button
            disabled={loading}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-muted-foreground hover:bg-secondary transition-colors text-xs"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            <span>Répondre</span>
          </button>
          <button
            disabled={loading}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-muted-foreground hover:bg-secondary transition-colors text-xs"
          >
            <Share2 className="size-4" aria-hidden="true" />
            <span>Partager</span>
          </button>
        </div>
      )}
    </div>
  )
}
