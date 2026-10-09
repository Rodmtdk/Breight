import type { IceCandidateJSON } from "@/lib/db/schema"

export const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
]

export function createPeerConnection() {
  return new RTCPeerConnection({
    iceServers: ICE_SERVERS,
    iceCandidatePoolSize: 4,
  })
}

export function waitForIceGathering(pc: RTCPeerConnection, timeoutMs = 2500) {
  if (pc.iceGatheringState === "complete") return Promise.resolve()
  return new Promise<void>((resolve) => {
    const done = () => {
      pc.removeEventListener("icegatheringstatechange", onChange)
      window.clearTimeout(timer)
      resolve()
    }
    const onChange = () => {
      if (pc.iceGatheringState === "complete") done()
    }
    pc.addEventListener("icegatheringstatechange", onChange)
    const timer = window.setTimeout(done, timeoutMs)
  })
}

export async function getCallMedia(kind: "audio" | "video") {
  return navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    video:
      kind === "video"
        ? { facingMode: "user", width: { ideal: 720 }, height: { ideal: 1280 } }
        : false,
  })
}

export function toIcePayload(candidate: RTCIceCandidate): IceCandidateJSON {
  return {
    candidate: candidate.candidate,
    sdpMid: candidate.sdpMid,
    sdpMLineIndex: candidate.sdpMLineIndex,
  }
}

export function mediaErrorMessage(error: unknown, kind: "audio" | "video") {
  const name = error instanceof DOMException ? error.name : ""
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return kind === "video"
      ? "Micro ou caméra refusé. Autorise-les dans le navigateur, ou ouvre l'app dans un onglet plutôt que dans l'aperçu intégré."
      : "Micro refusé. Autorise-le dans le navigateur, ou ouvre l'app dans un onglet plutôt que dans l'aperçu intégré."
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return kind === "video" ? "Aucune caméra ou micro détecté sur cet appareil." : "Aucun micro détecté sur cet appareil."
  }
  return "Impossible de démarrer l'appel."
}
