"use client"

import _sodium from "libsodium-wrappers"

// E2E encryption using libsodium crypto_box (X25519 + XSalsa20-Poly1305).
// Private keys are generated on-device and NEVER leave the device — this is
// the core zero-knowledge guarantee: the server only ever stores ciphertext.

let sodiumReady: Promise<typeof _sodium> | null = null

async function getSodium() {
  if (!sodiumReady) {
    sodiumReady = _sodium.ready.then(() => _sodium)
  }
  return sodiumReady
}

const KEYPAIR_STORAGE_KEY = "breight_e2e_keypair_v1"

export interface StoredKeyPair {
  publicKey: string // base64
  privateKey: string // base64 — device-local only
}

/**
 * Get or create the device keypair. The private key never leaves this device.
 */
export async function getOrCreateKeyPair(): Promise<StoredKeyPair> {
  const sodium = await getSodium()
  const existing = typeof window !== "undefined" ? window.localStorage.getItem(KEYPAIR_STORAGE_KEY) : null
  if (existing) {
    try {
      return JSON.parse(existing) as StoredKeyPair
    } catch {
      // fall through and regenerate
    }
  }
  const kp = sodium.crypto_box_keypair()
  const stored: StoredKeyPair = {
    publicKey: sodium.to_base64(kp.publicKey, sodium.base64_variants.ORIGINAL),
    privateKey: sodium.to_base64(kp.privateKey, sodium.base64_variants.ORIGINAL),
  }
  window.localStorage.setItem(KEYPAIR_STORAGE_KEY, JSON.stringify(stored))
  return stored
}

export async function encryptMessage(
  plaintext: string,
  recipientPublicKeyB64: string,
): Promise<{ ciphertext: string; nonce: string }> {
  const sodium = await getSodium()
  const { privateKey } = await getOrCreateKeyPair()
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES)
  const ciphertext = sodium.crypto_box_easy(
    sodium.from_string(plaintext),
    nonce,
    sodium.from_base64(recipientPublicKeyB64, sodium.base64_variants.ORIGINAL),
    sodium.from_base64(privateKey, sodium.base64_variants.ORIGINAL),
  )
  return {
    ciphertext: sodium.to_base64(ciphertext, sodium.base64_variants.ORIGINAL),
    nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL),
  }
}

export async function decryptMessage(
  ciphertextB64: string,
  nonceB64: string,
  otherPartyPublicKeyB64: string,
): Promise<string | null> {
  try {
    const sodium = await getSodium()
    const { privateKey } = await getOrCreateKeyPair()
    const plaintext = sodium.crypto_box_open_easy(
      sodium.from_base64(ciphertextB64, sodium.base64_variants.ORIGINAL),
      sodium.from_base64(nonceB64, sodium.base64_variants.ORIGINAL),
      sodium.from_base64(otherPartyPublicKeyB64, sodium.base64_variants.ORIGINAL),
      sodium.from_base64(privateKey, sodium.base64_variants.ORIGINAL),
    )
    return sodium.to_string(plaintext)
  } catch {
    return null
  }
}
