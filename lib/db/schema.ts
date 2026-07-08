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
