import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  doublePrecision,
  date,
  jsonb,
  unique,
} from "drizzle-orm/pg-core"

// ---------- Better Auth tables (do not rename columns) ----------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// ---------- BREIGHT app tables ----------

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().unique(),
  displayName: text("displayName").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  age: integer("age"),
  location: text("location"),
  interests: text("interests").array().default([]),
  isDiscoverable: boolean("isDiscoverable").notNull().default(true),
  isVerified: boolean("isVerified").notNull().default(false),
  publicKey: text("publicKey"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const relationships = pgTable(
  "relationships",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId1: text("userId1").notNull(),
    userId2: text("userId2").notNull(),
    relationshipType: text("relationshipType").notNull().default("friend"),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId1, t.userId2)],
)

export const swipes = pgTable(
  "swipes",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userIdFrom: text("userIdFrom").notNull(),
    userIdTo: text("userIdTo").notNull(),
    action: text("action").notNull(), // 'like' | 'pass'
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userIdFrom, t.userIdTo)],
)

export const matches = pgTable(
  "matches",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId1: text("userId1").notNull(),
    userId2: text("userId2").notNull(),
    matchedAt: timestamp("matchedAt").notNull().defaultNow(),
    relationshipId: text("relationshipId"),
  },
  (t) => [unique().on(t.userId1, t.userId2)],
)

export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId1: text("userId1").notNull(),
    userId2: text("userId2").notNull(),
    relationshipId: text("relationshipId"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId1, t.userId2)],
)

export const messages = pgTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversationId: text("conversationId").notNull(),
  senderId: text("senderId").notNull(),
  ciphertext: text("ciphertext").notNull(),
  nonce: text("nonce").notNull(),
  messageType: text("messageType").notNull().default("text"), // 'text' | 'prompt' | 'mood' | 'music'
  promptId: text("promptId"),
  moodTag: text("moodTag"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  expiresAt: timestamp("expiresAt"),
  isRead: boolean("isRead").notNull().default(false),
})

export const moodEntries = pgTable("mood_entries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull(),
  mood: text("mood").notNull(),
  intensity: integer("intensity").notNull().default(3),
  note: text("note"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const empathyMetrics = pgTable(
  "empathy_metrics",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    conversationId: text("conversationId").notNull(),
    userId: text("userId").notNull(),
    messagesSent: integer("messagesSent").notNull().default(0),
    questionsAsked: integer("questionsAsked").notNull().default(0),
    promptsUsed: integer("promptsUsed").notNull().default(0),
    moodShares: integer("moodShares").notNull().default(0),
    connectionScore: integer("connectionScore").notNull().default(0),
    date: date("date").notNull().defaultNow(),
  },
  (t) => [unique().on(t.conversationId, t.userId, t.date)],
)

export const feedItems = pgTable("feed_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull(),
  mediaUrl: text("mediaUrl"),
  content: text("content"),
  feedType: text("feedType").notNull().default("moment"), // 'moment' | 'note' | 'status'
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  expiresAt: timestamp("expiresAt"),
  visibility: text("visibility").notNull().default("friends"),
})

export const momentPostWindow = pgTable("moment_post_window", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().unique(),
  lastPostedAt: timestamp("lastPostedAt"),
  notificationSentAt: timestamp("notificationSentAt"),
  postWindowOpensAt: timestamp("postWindowOpensAt").notNull(), // Today at 12:12 UTC
  postWindowClosesAt: timestamp("postWindowClosesAt").notNull(), // Tomorrow at 12:12 UTC
  hasPostedToday: boolean("hasPostedToday").notNull().default(false),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const notes = pgTable("notes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull(),
  relationshipId: text("relationshipId").notNull(),
  content: text("content"),
  imageUrl: text("imageUrl"),
  color: text("color").default("default"),
  pinnedAt: timestamp("pinnedAt").notNull().defaultNow(),
  expiresAt: timestamp("expiresAt"),
  position: integer("position").default(0),
})

export const musicShares = pgTable("music_shares", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull(),
  conversationId: text("conversationId"),
  youtubeVideoId: text("youtubeVideoId").notNull(),
  title: text("title").notNull(),
  artist: text("artist"),
  message: text("message"),
  sharedAt: timestamp("sharedAt").notNull().defaultNow(),
})

export const locations = pgTable("locations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull().unique(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  label: text("label"),
  isSharing: boolean("isSharing").notNull().default(false),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId"),
  action: text("action").notNull(),
  resource: text("resource"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// ---------- RARITY FEATURES ----------

// 1. ECHOES SYSTEM — Réponses créent du contenu émergent visible aux autres
export const echoes = pgTable("echoes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversationId: text("conversationId").notNull(),
  originalMessageId: text("originalMessageId").notNull(), // Le message qui crée l'echo
  authorId: text("authorId").notNull(), // Qui a répondu
  content: text("content").notNull(), // La réponse (déchiffrée pour créer l'echo)
  visibility: text("visibility").notNull().default("friends"), // 'friends' | 'network' | 'public'
  likeCount: integer("likeCount").notNull().default(0),
  echoedAt: timestamp("echoedAt").notNull().defaultNow(),
})

// 2. LISTENING STYLE — Comment l'utilisateur écoute (pattern d'écoute unique)
export const listeningStyle = pgTable(
  "listening_style",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull().unique(),
    style: text("style").notNull(), // 'Patient' | 'Direct' | 'Empathetic' | 'Curious' | 'Reflective'
    traits: jsonb("traits").default({}), // {asks_follow_ups: 8.2, shares_emotions: 7.1, ...}
    compatibility: jsonb("compatibility").default({}), // {Patient: 85, Direct: 72, ...}
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId)],
)

// 3. PASSAGES & RITUALS — Rites d'initiation débloqués en montant en niveau
export const passages = pgTable(
  "passages",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull(),
    level: integer("level").notNull(), // 0: Sprout, 1: Listener, 2: Empath, 3: Sage, 4: Heart Listener
    ritualCompleted: boolean("ritualCompleted").notNull().default(false),
    ritualCompletedAt: timestamp("ritualCompletedAt"),
    badge: text("badge"), // 'sprout_ritual' | 'listener_ritual' | ...
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.level)],
)

// 4. WEEKLY REFLECTIONS — Histoires poétiques hebdomadaires d'écoute
export const weeklyReflections = pgTable(
  "weekly_reflections",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull(),
    weekStart: date("weekStart").notNull(),
    narrative: text("narrative").notNull(), // Texte narratif poétique généré
    stats: jsonb("stats").default({}), // {follow_ups: 47, questions: 23, ...}
    listeningScore: integer("listeningScore"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.weekStart)],
)

// 5. DAILY RITUALS — Morning intentions & Night reflections
export const dailyRituals = pgTable(
  "daily_rituals",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull(),
    date: date("date").notNull(),
    morningIntention: text("morningIntention"), // "Je vais écouter sans juger aujourd'hui"
    nightReflection: text("nightReflection"), // "Qui m'a vraiment écouté aujourd'hui ?"
    morningCompletedAt: timestamp("morningCompletedAt"),
    nightCompletedAt: timestamp("nightCompletedAt"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.date)],
)

// ---------- SOCIAL NETWORK ----------

// Reactions (likes) sur Echoes/Moments
export const reactions = pgTable(
  "reactions",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull(),
    echoId: text("echoId").notNull(),
    emoji: text("emoji").notNull().default("heart"), // 'heart' | 'fire' | 'light' | 'smile' | 'pray'
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.echoId)],
)

// Comments sur Echoes
export const echoComments = pgTable("echo_comments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  echoId: text("echoId").notNull(),
  userId: text("userId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// Follows (Social graph)
export const follows = pgTable(
  "follows",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    followerId: text("followerId").notNull(), // Qui suit
    followingId: text("followingId").notNull(), // Qui est suivi
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => [unique().on(t.followerId, t.followingId)],
)

// Trending cache (mis à jour par cron)
export const trending = pgTable(
  "trending",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    echoId: text("echoId").notNull().unique(),
    score: integer("score").notNull().default(0), // Calcul: reactions * 2 + comments * 3
    rank: integer("rank").notNull(), // Position dans le trending
    period: text("period").notNull().default("today"), // 'today' | 'week' | 'all'
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => [unique().on(t.echoId, t.period)],
)

// Social Notifications (pour FOMO builder)
export const socialNotifications = pgTable("social_notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").notNull(), // Qui reçoit la notif
  actionUserId: text("actionUserId").notNull(), // Qui a fait l'action
  type: text("type").notNull(), // 'like' | 'comment' | 'follow' | 'share'
  targetId: text("targetId").notNull(), // echoId ou userId
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
