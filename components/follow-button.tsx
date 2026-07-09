'use client'

import { useState, useEffect } from 'react'
import { toggleFollow, isFollowing as checkIsFollowing } from '@/app/actions/social'
import { Button } from '@/components/ui/button'
import { UserPlus, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FollowButtonProps {
  userId: string
  initialFollowing?: boolean
  size?: 'sm' | 'md'
  variant?: 'default' | 'outline'
}

export function FollowButton({ userId, initialFollowing = false, size = 'md', variant = 'default' }: FollowButtonProps) {
  const [isFollowingState, setIsFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  const handleToggleFollow = async () => {
    setLoading(true)
    try {
      await toggleFollow(userId)
      setIsFollowing(!isFollowingState)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={loading}
      variant={isFollowingState ? 'outline' : variant}
      size={size}
      className={cn(
        'gap-2 transition-all',
        isFollowingState && 'bg-jade/10 text-jade border-jade hover:bg-jade/20',
      )}
    >
      {isFollowingState ? (
        <>
          <UserCheck className="size-4" aria-hidden="true" />
          <span>Abonné</span>
        </>
      ) : (
        <>
          <UserPlus className="size-4" aria-hidden="true" />
          <span>Abonner</span>
        </>
      )}
    </Button>
  )
}
