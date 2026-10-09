"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"
import {
  acceptCall,
  declineCall,
  endCall,
  getCall,
  getIncomingCall,
  pushIce,
  startCall,
  type CallKind,
} from "@/app/actions/calls"
import type { IceCandidateJSON } from "@/lib/db/schema"
import {
  createPeerConnection,
  getCallMedia,
  mediaErrorMessage,
  toIcePayload,
  waitForIceGathering,
} from "@/lib/call-media"
import { CallStage } from "@/components/chat/call-stage"

type CallPhase = "preparing" | "outgoing" | "incoming" | "connecting" | "connected" | "ended"

type CallSession = {
  callId: string
  conversationId: string
  kind: CallKind
  role: "caller" | "callee"
  peerName: string
  peerAvatar: string | null
  phase: CallPhase
  error: string | null
  offerSdp: string | null
}

type StartCallInput = {
  conversationId: string
  kind: CallKind
  peerName: string
  peerAvatar: string | null
}

const CallContext = createContext<{
  startCall: (input: StartCallInput) => Promise<void>
  busy: boolean
} | null>(null)

export function useCall() {
  const ctx = useContext(CallContext)
  if (!ctx) throw new Error("useCall must be used inside CallProvider")
  return ctx
}

function formatElapsed(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${String(mins).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
}

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<CallSession | null>(null)
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const sessionRef = useRef<CallSession | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const callIdRef = useRef<string | null>(null)
  const pendingIceRef = useRef<IceCandidateJSON[]>([])
  const seenIceRef = useRef(new Set<string>())
  const remoteDescSetRef = useRef(false)
  const endedRef = useRef(false)
  const startingRef = useRef(false)
  const dismissedRef = useRef<string | null>(null)
  const connectedAtRef = useRef<number | null>(null)
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)

  sessionRef.current = session

  const { data: incoming } = useSWR("incoming-call", getIncomingCall, {
    refreshInterval: session ? 0 : 2000,
    revalidateOnFocus: true,
  })

  const attachLocalPreview = useCallback(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current
    }
  }, [])

  const cleanupPeer = useCallback(() => {
    pcRef.current?.getSenders().forEach((sender) => sender.track?.stop())
    pcRef.current?.close()
    pcRef.current = null
    localStreamRef.current?.getTracks().forEach((track) => track.stop())
    localStreamRef.current = null
    remoteDescSetRef.current = false
    seenIceRef.current.clear()
    pendingIceRef.current = []
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null
  }, [])

  const finish = useCallback(
    (message: string | null) => {
      if (endedRef.current) return
      endedRef.current = true
      cleanupPeer()
      setHasRemoteVideo(false)
      setMuted(false)
      setCameraOff(false)
      connectedAtRef.current = null
      setSession((current) =>
        current ? { ...current, phase: "ended", error: message } : current,
      )
      window.setTimeout(() => {
        setSession(null)
        callIdRef.current = null
        endedRef.current = false
      }, 1600)
    },
    [cleanupPeer],
  )

  const applyRemoteIce = useCallback(async (list: IceCandidateJSON[]) => {
    const pc = pcRef.current
    if (!pc || !remoteDescSetRef.current) return
    for (const candidate of list) {
      if (seenIceRef.current.has(candidate.candidate)) continue
      seenIceRef.current.add(candidate.candidate)
      try {
        await pc.addIceCandidate(candidate)
      } catch (error) {
        console.error("[v0] ICE candidate rejected", error)
      }
    }
  }, [])

  const wirePeer = useCallback(
    (pc: RTCPeerConnection) => {
      pc.onicecandidate = (event) => {
        if (!event.candidate) return
        const payload = toIcePayload(event.candidate)
        const callId = callIdRef.current
        if (!callId) {
          pendingIceRef.current.push(payload)
          return
        }
        pushIce({ callId, candidate: payload }).catch((error) => {
          console.error("[v0] ICE push failed", error)
        })
      }
      pc.ontrack = (event) => {
        const stream = event.streams[0]
        if (!stream) return
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = stream
        if (stream.getVideoTracks().length > 0) setHasRemoteVideo(true)
      }
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          connectedAtRef.current = connectedAtRef.current ?? Date.now()
          setSession((current) => (current ? { ...current, phase: "connected", error: null } : current))
        }
        if (pc.connectionState === "failed") {
          setSession((current) =>
            current
              ? {
                  ...current,
                  error: "Connexion impossible. Réessaie, idéalement sur le même réseau Wi-Fi.",
                }
              : current,
          )
        }
      }
    },
    [],
  )

  const flushPendingIce = useCallback(async (callId: string) => {
    const queued = pendingIceRef.current.splice(0)
    await Promise.all(queued.map((candidate) => pushIce({ callId, candidate }).catch(() => undefined)))
  }, [])

  const beginCall = useCallback(
    async (input: StartCallInput) => {
      if (startingRef.current || sessionRef.current) return
      startingRef.current = true
      endedRef.current = false
      setMuted(false)
      setCameraOff(false)
      setHasRemoteVideo(false)
      setElapsed(0)
      setSession({
        callId: "",
        conversationId: input.conversationId,
        kind: input.kind,
        role: "caller",
        peerName: input.peerName,
        peerAvatar: input.peerAvatar,
        phase: "preparing",
        error: null,
        offerSdp: null,
      })

      try {
        const stream = await getCallMedia(input.kind)
        if (endedRef.current) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        localStreamRef.current = stream
        attachLocalPreview()
        const pc = createPeerConnection()
        pcRef.current = pc
        wirePeer(pc)
        for (const track of stream.getTracks()) pc.addTrack(track, stream)
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        await waitForIceGathering(pc)
        if (endedRef.current) return
        const offerSdp = pc.localDescription?.sdp
        if (!offerSdp) throw new Error("Missing offer")
        const { callId } = await startCall({
          conversationId: input.conversationId,
          kind: input.kind,
          offerSdp,
        })
        if (endedRef.current) {
          await endCall(callId).catch(() => undefined)
          return
        }
        callIdRef.current = callId
        await flushPendingIce(callId)
        setSession((current) =>
          current ? { ...current, callId, phase: "outgoing", offerSdp } : current,
        )
      } catch (error) {
        console.error("[v0] start call failed", error)
        cleanupPeer()
        setSession((current) =>
          current
            ? { ...current, phase: "ended", error: mediaErrorMessage(error, input.kind) }
            : current,
        )
        window.setTimeout(() => setSession(null), 2200)
      } finally {
        startingRef.current = false
      }
    },
    [attachLocalPreview, cleanupPeer, flushPendingIce, wirePeer],
  )

  const accept = useCallback(async () => {
    const current = sessionRef.current
    if (!current?.offerSdp || current.role !== "callee") return
    setSession({ ...current, phase: "connecting", error: null })
    try {
      const stream = await getCallMedia(current.kind)
      localStreamRef.current = stream
      attachLocalPreview()
      const pc = createPeerConnection()
      pcRef.current = pc
      wirePeer(pc)
      for (const track of stream.getTracks()) pc.addTrack(track, stream)
      await pc.setRemoteDescription({ type: "offer", sdp: current.offerSdp })
      remoteDescSetRef.current = true
      const latest = await getCall(current.callId)
      await applyRemoteIce(latest.callerIce)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      await waitForIceGathering(pc)
      const answerSdp = pc.localDescription?.sdp
      if (!answerSdp) throw new Error("Missing answer")
      const result = await acceptCall({ callId: current.callId, answerSdp })
      if (!result.ok) {
        finish("L'appel n'est plus disponible.")
        return
      }
      await flushPendingIce(current.callId)
    } catch (error) {
      console.error("[v0] accept call failed", error)
      cleanupPeer()
      finish(mediaErrorMessage(error, current.kind))
    }
  }, [applyRemoteIce, attachLocalPreview, cleanupPeer, finish, flushPendingIce, wirePeer])

  const hangup = useCallback(async () => {
    const current = sessionRef.current
    if (!current) return
    dismissedRef.current = current.callId || dismissedRef.current
    if (current.phase === "incoming" && current.callId) {
      await declineCall(current.callId).catch(() => undefined)
      finish("Appel refusé")
      return
    }
    if (current.callId) await endCall(current.callId).catch(() => undefined)
    finish(null)
  }, [finish])

  useEffect(() => {
    if (!incoming || sessionRef.current) return
    if (dismissedRef.current === incoming.callId) return
    callIdRef.current = incoming.callId
    endedRef.current = false
    setSession({
      callId: incoming.callId,
      conversationId: incoming.conversationId,
      kind: incoming.kind,
      role: "callee",
      peerName: incoming.callerName,
      peerAvatar: incoming.callerAvatar,
      phase: "incoming",
      error: null,
      offerSdp: incoming.offerSdp,
    })
  }, [incoming])

  useEffect(() => {
    const callId = session?.callId
    if (!callId || session.phase === "preparing" || session.phase === "ended") return
    let cancelled = false

    const tick = async () => {
      try {
        const call = await getCall(callId)
        if (cancelled || endedRef.current) return
        if (call.status === "declined") return finish("Appel refusé")
        if (call.status === "missed") return finish("Appel manqué")
        if (call.status === "ended") return finish(null)
        const role = sessionRef.current?.role
        const pc = pcRef.current
        if (role === "caller" && call.answerSdp && pc && !remoteDescSetRef.current) {
          await pc.setRemoteDescription({ type: "answer", sdp: call.answerSdp })
          remoteDescSetRef.current = true
          setSession((current) =>
            current && current.phase !== "connected" ? { ...current, phase: "connecting" } : current,
          )
          await applyRemoteIce(call.calleeIce)
        } else if (remoteDescSetRef.current) {
          await applyRemoteIce(role === "caller" ? call.calleeIce : call.callerIce)
        }
      } catch (error) {
        console.error("[v0] call poll failed", error)
      }
    }

    tick()
    const timer = window.setInterval(tick, 1000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [applyRemoteIce, finish, session?.callId, session?.phase])

  useEffect(() => {
    if (session?.phase !== "connected") return
    const timer = window.setInterval(() => {
      if (!connectedAtRef.current) return
      setElapsed(Math.floor((Date.now() - connectedAtRef.current) / 1000))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [session?.phase])

  useEffect(() => {
    if (session?.phase !== "incoming" && session?.phase !== "outgoing") return
    let stopped = false
    const AudioContextCtor = window.AudioContext
    const audio = new AudioContextCtor()
    const ring = () => {
      if (stopped || audio.state === "closed") return
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.type = "sine"
      osc.frequency.value = session.phase === "incoming" ? 440 : 494
      gain.gain.setValueAtTime(0.0001, audio.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.04, audio.currentTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.32)
      osc.connect(gain).connect(audio.destination)
      osc.start()
      osc.stop(audio.currentTime + 0.34)
      navigator.vibrate?.(session.phase === "incoming" ? [160, 80, 160] : [30])
    }
    audio.resume().then(ring).catch(() => undefined)
    const timer = window.setInterval(ring, session.phase === "incoming" ? 1500 : 2100)
    return () => {
      stopped = true
      window.clearInterval(timer)
      audio.close().catch(() => undefined)
      navigator.vibrate?.(0)
    }
  }, [session?.phase])

  useEffect(() => {
    if (!session) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") hangup()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [hangup, session])

  useEffect(() => {
    attachLocalPreview()
  }, [attachLocalPreview, session?.phase])

  const statusLabel = useMemo(() => {
    if (!session) return ""
    if (session.phase === "preparing") return "Préparation…"
    if (session.phase === "outgoing") return "Appel en cours…"
    if (session.phase === "incoming") return session.kind === "video" ? "Appel vidéo entrant" : "Appel audio entrant"
    if (session.phase === "connecting") return "Connexion…"
    if (session.phase === "connected") return formatElapsed(elapsed)
    return session.error ? "Appel impossible" : "Appel terminé"
  }, [elapsed, session])

  const toggleMute = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setMuted(!track.enabled)
  }, [])

  const toggleCamera = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setCameraOff(!track.enabled)
  }, [])

  const flipCamera = useCallback(async () => {
    const pc = pcRef.current
    const stream = localStreamRef.current
    const currentTrack = stream?.getVideoTracks()[0]
    if (!pc || !stream || !currentTrack) return
    const facing = currentTrack.getSettings().facingMode === "environment" ? "user" : "environment"
    try {
      const next = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false })
      const nextTrack = next.getVideoTracks()[0]
      const sender = pc.getSenders().find((item) => item.track?.kind === "video")
      await sender?.replaceTrack(nextTrack)
      currentTrack.stop()
      stream.removeTrack(currentTrack)
      stream.addTrack(nextTrack)
      attachLocalPreview()
    } catch (error) {
      console.error("[v0] camera flip failed", error)
    }
  }, [attachLocalPreview])

  const value = useMemo(() => ({ startCall: beginCall, busy: session !== null }), [beginCall, session])

  return (
    <CallContext.Provider value={value}>
      {children}
      {session ? (
        <CallStage
          kind={session.kind}
          phase={session.phase}
          peerName={session.peerName}
          peerAvatar={session.peerAvatar}
          statusLabel={statusLabel}
          error={session.error}
          muted={muted}
          cameraOff={cameraOff}
          hasRemoteVideo={hasRemoteVideo}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          remoteAudioRef={remoteAudioRef}
          onAccept={accept}
          onDecline={hangup}
          onHangup={hangup}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
          onFlipCamera={flipCamera}
        />
      ) : null}
    </CallContext.Provider>
  )
}
