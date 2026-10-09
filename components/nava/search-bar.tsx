'use client'

import { Clock, Loader2, MapPin, Search, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSearchHistory } from '@/hooks/use-search-history'
import type { GeocodeResult } from '@/lib/types'

interface SearchBarProps {
  profileId: string | null
  onSelect: (result: GeocodeResult) => void
}

export function SearchBar({ profileId, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { history, addToHistory, clearHistory } = useSearchHistory(profileId)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.results ?? [])
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handlePick(result: GeocodeResult) {
    onSelect(result)
    addToHistory(result.label, result.lat, result.lng)
    setQuery(result.label)
    setOpen(false)
  }

  const showHistory = open && query.trim().length < 2 && history.length > 0
  const showResults = open && results.length > 0

  return (
    <div ref={containerRef} className="relative">
      <div className="flex h-11 items-center gap-2 rounded-xl border border-input bg-secondary/60 px-3 focus-within:ring-2 focus-within:ring-ring/50">
        {loading ? <Loader2 size={17} className="shrink-0 animate-spin text-muted-foreground" /> : <Search size={17} className="shrink-0 text-muted-foreground" />}
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher une destination"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Rechercher une destination"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setResults([])
            }}
            aria-label="Effacer la recherche"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      {showResults ? (
        <ul className="absolute inset-x-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-lg">
          {results.map((result) => (
            <li key={`${result.lat}-${result.lng}`}>
              <button
                type="button"
                onClick={() => handlePick(result)}
                className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-accent"
              >
                <MapPin size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
                <span className="line-clamp-2 text-xs leading-snug">{result.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {showHistory ? (
        <div className="absolute inset-x-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-lg">
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Recherches récentes</p>
            <button
              type="button"
              onClick={() => clearHistory()}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
              aria-label="Effacer l'historique de recherche"
            >
              <Trash2 size={11} />
              Effacer
            </button>
          </div>
          <ul>
            {history.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => handlePick({ label: entry.label, lat: entry.lat, lng: entry.lng })}
                  className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-accent"
                >
                  <Clock size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <span className="line-clamp-2 text-xs leading-snug">{entry.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
