// Nava has no account system — each browser gets an anonymous profile row
// (for the reliability score) identified by a UUID kept in localStorage.
// This stores a client identifier only; the actual profile data lives in
// Supabase, not in localStorage.
const STORAGE_KEY = 'nava-profile-id'

export function getLocalProfileId(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(STORAGE_KEY)
}

export function setLocalProfileId(id: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, id)
}
