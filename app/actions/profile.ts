"use server"
// v2 — publishPublicKey returns silently when unauthenticated (no 500 on auth pages)

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { profiles, auditLogs, publicProfilePages } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

export async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

export async function getMyProfile() {
  const userId = await getUserId()
  const rows = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1)
  return rows[0] ?? null
}

export async function createPublicPage(data: {
  pageType: "company" | "project"
  name: string
  slug: string
  tagline?: string
  description?: string
  location?: string
  websiteUrl?: string
  contactEmail?: string
  highlights?: string[]
}) {
  const userId = await getUserId()
  const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
  if (!slug || !data.name.trim()) throw new Error("Nom et adresse requis")
  const existing = await db.select({ id: publicProfilePages.id }).from(publicProfilePages).where(eq(publicProfilePages.slug, slug)).limit(1)
  if (existing.length) throw new Error("Cette adresse BR8 est déjà utilisée")
  const [page] = await db.insert(publicProfilePages).values({
    ownerUserId: userId,
    slug,
    pageType: data.pageType,
    name: data.name.trim(),
    tagline: data.tagline?.trim() || null,
    description: data.description?.trim() || null,
    location: data.location?.trim() || null,
    websiteUrl: data.websiteUrl?.trim() || null,
    contactEmail: data.contactEmail?.trim() || null,
    highlights: data.highlights ?? [],
  }).returning()
  revalidatePath("/profile")
  return page
}

export async function getMyPublicPages() {
  const userId = await getUserId()
  return db.select().from(publicProfilePages).where(eq(publicProfilePages.ownerUserId, userId)).orderBy(publicProfilePages.updatedAt)
}

export async function getPublicProfile(userId: string) {
  const rows = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1)
  const profile = rows[0]
  if (!profile || !profile.isDiscoverable) return null
  return profile
}

export async function upsertProfile(data: {
  displayName: string
  bio?: string
  age?: number
  location?: string
  interests?: string[]
  isDiscoverable?: boolean
}) {
  const userId = await getUserId()
  const existing = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1)
  if (existing.length > 0) {
    await db
      .update(profiles)
      .set({
        displayName: data.displayName,
        bio: data.bio ?? null,
        age: data.age ?? null,
        location: data.location ?? null,
        interests: data.interests ?? [],
        isDiscoverable: data.isDiscoverable ?? true,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, userId))
  } else {
    await db.insert(profiles).values({
      userId,
      displayName: data.displayName,
      bio: data.bio ?? null,
      age: data.age ?? null,
      location: data.location ?? null,
      interests: data.interests ?? [],
      isDiscoverable: data.isDiscoverable ?? true,
    })
  }
  await db.insert(auditLogs).values({
    userId,
    action: existing.length > 0 ? "profile.update" : "profile.create",
    resource: "profiles",
  })
  revalidatePath("/profile")
  revalidatePath("/")
}

/**
 * Publish the device's E2E public key so other users can encrypt messages
 * for this user. Only the PUBLIC key is ever sent to the server.
 */
export async function publishPublicKey(publicKey: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  // Best-effort background sync: no session on public pages (sign-in/sign-up).
  // Return silently instead of throwing so the page never 500s.
  if (!session?.user) return { ok: false }
  const userId = session.user.id
  const existing = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1)
  if (existing.length > 0) {
    await db.update(profiles).set({ publicKey, updatedAt: new Date() }).where(eq(profiles.userId, userId))
  } else {
    // First launch on this device before the profile was filled in:
    // create a minimal profile so the public key is available to contacts.
    await db.insert(profiles).values({
      userId,
      displayName: session.user.name || "Utilisateur",
      publicKey,
    })
  }
}
