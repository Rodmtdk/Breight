'use client'

import { Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

const CYCLE = ['system', 'light', 'dark'] as const

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const current = mounted ? (theme ?? 'system') : 'system'
  const Icon = current === 'dark' ? Moon : current === 'light' ? Sun : Laptop

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Thème : ${current}. Cliquez pour changer.`}
      onClick={() => {
        const nextIndex = (CYCLE.indexOf(current as (typeof CYCLE)[number]) + 1) % CYCLE.length
        setTheme(CYCLE[nextIndex])
      }}
    >
      <Icon size={18} />
    </Button>
  )
}
