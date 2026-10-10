'use client'

import { Sparkles, Type, WandSparkles } from 'lucide-react'

export type CameraEffect = 'original' | 'warm' | 'cool' | 'mono'

const effects: { id: CameraEffect; label: string; className: string }[] = [
  { id: 'original', label: 'Original', className: '' },
  { id: 'warm', label: 'Sunset', className: 'saturate-125 sepia-[.18] hue-rotate-[-8deg]' },
  { id: 'cool', label: 'Cobalt', className: 'saturate-110 hue-rotate-[18deg] brightness-105' },
  { id: 'mono', label: 'Mono', className: 'grayscale contrast-110' },
]

type Props = {
  effect: CameraEffect
  onEffectChange: (effect: CameraEffect) => void
  sticker: string | null
  onStickerChange: (sticker: string | null) => void
  caption: string
  onCaptionChange: (caption: string) => void
}

export function CameraEffects({ effect, onEffectChange, sticker, onStickerChange, caption, onCaptionChange }: Props) {
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-40 z-10 space-y-3 px-5">
      {caption ? <div className="mx-auto w-fit rounded-xl bg-black/40 px-4 py-2 text-center text-lg font-black text-white backdrop-blur-xl">{caption}</div> : null}
      {sticker ? <div className="mx-auto w-fit rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur-xl">{sticker}</div> : null}
      <div className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 gap-2 overflow-x-auto rounded-2xl border border-white/15 bg-black/25 p-2 backdrop-blur-xl">
          {effects.map((item) => (
            <button key={item.id} type="button" onClick={() => onEffectChange(item.id)} className={`shrink-0 rounded-xl px-3 py-2 text-[11px] font-semibold transition ${effect === item.id ? 'bg-white text-black' : 'text-white/75 hover:bg-white/15'}`}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => onStickerChange(sticker ? null : 'BR8')} aria-label="Ajouter un sticker" className={`grid size-10 place-items-center rounded-xl backdrop-blur-xl ${sticker ? 'bg-gold text-background' : 'bg-black/25 text-white'}`}><Sparkles className="size-4" /></button>
          <button type="button" onClick={() => onCaptionChange(caption ? '' : 'Maintenant')} aria-label="Ajouter un texte" className={`grid size-10 place-items-center rounded-xl backdrop-blur-xl ${caption ? 'bg-gold text-background' : 'bg-black/25 text-white'}`}><Type className="size-4" /></button>
        </div>
      </div>
      <p className="flex items-center justify-center gap-1 text-center text-[10px] font-medium text-white/60"><WandSparkles className="size-3" /> Effets légers, sans surcharge</p>
    </div>
  )
}

export function effectClassName(effect: CameraEffect) {
  return effects.find((item) => item.id === effect)?.className ?? ''
}
