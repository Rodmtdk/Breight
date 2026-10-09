"use client"

import { Mic, MicOff, Phone, PhoneOff, SwitchCamera, Video, VideoOff } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type CallKind = "audio" | "video"
type CallPhase = "preparing" | "outgoing" | "incoming" | "connecting" | "connected" | "ended"

export function CallStage({
  kind,
  phase,
  peerName,
  peerAvatar,
  statusLabel,
  error,
  muted,
  cameraOff,
  hasRemoteVideo,
  localVideoRef,
  remoteVideoRef,
  remoteAudioRef,
  onAccept,
  onDecline,
  onHangup,
  onToggleMute,
  onToggleCamera,
  onFlipCamera,
}: {
  kind: CallKind
  phase: CallPhase
  peerName: string
  peerAvatar: string | null
  statusLabel: string
  error: string | null
  muted: boolean
  cameraOff: boolean
  hasRemoteVideo: boolean
  localVideoRef: React.RefObject<HTMLVideoElement | null>
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>
  onAccept: () => void
  onDecline: () => void
  onHangup: () => void
  onToggleMute: () => void
  onToggleCamera: () => void
  onFlipCamera: () => void
}) {
  const showRemoteVideo = kind === "video" && hasRemoteVideo && phase !== "incoming"
  const showLocalPip = kind === "video" && phase !== "incoming" && phase !== "ended"
  const inCall = phase === "outgoing" || phase === "connecting" || phase === "connected" || phase === "preparing"
  const initials = peerName.slice(0, 2).toUpperCase()

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="call-peer-name"
      className="fixed inset-0 z-[80] mx-auto flex w-full max-w-md flex-col bg-[#0c1210] text-white"
    >
      <audio ref={remoteAudioRef} autoPlay className="sr-only" />

      <div className="relative min-h-0 flex-1">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={showRemoteVideo ? "size-full object-cover" : "hidden"}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-16">
          <p id="call-peer-name" className="truncate text-center text-lg font-medium">
            {peerName}
          </p>
          <p className="mt-1 text-center text-sm text-white/75" aria-live="polite">
            {statusLabel}
          </p>
        </div>

        {showRemoteVideo ? null : (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
            <div className="relative">
              {phase === "incoming" || phase === "outgoing" ? (
                <span className="absolute inset-0 animate-ping rounded-full bg-jade/30" aria-hidden="true" />
              ) : null}
              <Avatar className="relative size-28 ring-2 ring-white/15">
                <AvatarImage src={peerAvatar ?? undefined} alt="" />
                <AvatarFallback className="bg-jade text-2xl font-medium text-jade-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <p className="mt-5 text-center text-sm text-white/70">
              {kind === "video" ? "Appel vidéo" : "Appel audio"}
            </p>
          </div>
        )}

        {showLocalPip ? (
          <div className="absolute top-[max(5.5rem,env(safe-area-inset-top))] right-3 h-36 w-24 overflow-hidden rounded-2xl bg-black/50 ring-1 ring-white/20">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={cameraOff ? "size-full object-cover opacity-0" : "size-full scale-x-[-1] object-cover"}
            />
            {cameraOff ? (
              <div className="absolute inset-0 flex items-center justify-center text-white/80">
                <VideoOff className="size-5" aria-hidden="true" />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="px-6 pb-2 text-center text-sm leading-relaxed text-white/80">{error}</p>
      ) : null}

      <div className="flex items-center justify-center gap-4 px-6 pt-3 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
        {phase === "incoming" ? (
          <>
            <CallButton label="Refuser" tone="danger" onClick={onDecline}>
              <PhoneOff className="size-6" />
            </CallButton>
            <CallButton label="Accepter" tone="accept" onClick={onAccept}>
              {kind === "video" ? <Video className="size-6" /> : <Phone className="size-6" />}
            </CallButton>
          </>
        ) : null}

        {phase === "ended" ? (
          <CallButton label="Fermer" tone="ghost" onClick={onHangup}>
            <PhoneOff className="size-6" />
          </CallButton>
        ) : null}

        {inCall ? (
          <>
            <CallButton
              label={muted ? "Réactiver le micro" : "Couper le micro"}
              tone="ghost"
              onClick={onToggleMute}
            >
              {muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </CallButton>
            {kind === "video" ? (
              <>
                <CallButton
                  label={cameraOff ? "Réactiver la caméra" : "Couper la caméra"}
                  tone="ghost"
                  onClick={onToggleCamera}
                >
                  {cameraOff ? <VideoOff className="size-5" /> : <Video className="size-5" />}
                </CallButton>
                <CallButton label="Changer de caméra" tone="ghost" onClick={onFlipCamera}>
                  <SwitchCamera className="size-5" />
                </CallButton>
              </>
            ) : null}
            <CallButton label="Raccrocher" tone="danger" onClick={onHangup}>
              <PhoneOff className="size-6" />
            </CallButton>
          </>
        ) : null}
      </div>
    </div>
  )
}

function CallButton({
  label,
  tone,
  onClick,
  children,
}: {
  label: string
  tone: "danger" | "accept" | "ghost"
  onClick: () => void
  children: React.ReactNode
}) {
  const toneClass =
    tone === "danger"
      ? "bg-red-600 text-white"
      : tone === "accept"
        ? "bg-jade text-jade-foreground"
        : "bg-white/15 text-white"

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex size-14 shrink-0 items-center justify-center rounded-full touch-manipulation ${toneClass}`}
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  )
}
