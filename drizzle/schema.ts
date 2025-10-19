import { boolean, date, decimal, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  credits: int("credits").default(3).notNull(), // Free tier: 3 credits per month
  isBetaTester: boolean("isBetaTester").default(false).notNull(),
  betaInviteCode: varchar("betaInviteCode", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
  lastCreditRefresh: timestamp("lastCreditRefresh").defaultNow(),
  subscriptionPlan: varchar("subscriptionPlan", { length: 64 }),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "canceled", "past_due"]),
  subscriptionEndDate: timestamp("subscriptionEndDate"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Pet profiles - each user can have multiple pets
 */
export const pets = mysqlTable("pets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  species: mysqlEnum("species", ["dog", "cat", "other"]).notNull(),
  breed: varchar("breed", { length: 100 }),
  breedConfidence: varchar("breedConfidence", { length: 20 }), // low, medium, high
  breedCandidates: text("breedCandidates"), // JSON array of top 3 breed predictions
  age: varchar("age", { length: 50 }), // "2 years", "6 months", etc.
  photoUrl: varchar("photoUrl", { length: 500 }),
  notes: text("notes"),
  personality: mysqlEnum("personality", ["goofy", "wise", "sassy", "serious", "excited", "sleepy", "dramatic"]).default("goofy"),
  voiceStyle: varchar("voiceStyle", { length: 50 }).default("alloy"),
  behaviorPatterns: text("behaviorPatterns"),
  createdAt: timestamp("createdAt").defaultNow(),
});
export type Pet = typeof pets.$inferSelect;
export type InsertPet = typeof pets.$inferInsert;

/**
 * Behavior analyses - each analysis is tied to a pet
 */
export const analyses = mysqlTable("analyses", {
  id: varchar("id", { length: 64 }).primaryKey(),
  petId: varchar("petId", { length: 64 }).notNull(),
  mediaUrl: text("mediaUrl").notNull(),
  mediaType: mysqlEnum("mediaType", ["image", "video"]).notNull(),
  userContext: text("userContext"),
  photoDate: timestamp("photoDate"),
  petAgeAtPhoto: varchar("petAgeAtPhoto", { length: 64 }), // User's description of the situation
  
  // AI agent outputs (stored as JSON)
  visionData: text("visionData"), // JSON string
  contextData: text("contextData"), // JSON string
  synthesisData: text("synthesisData"), // JSON string
  recommendations: text("recommendations"), // JSON string
  
  // Top-level results for quick access
  primaryBehavior: varchar("primaryBehavior", { length: 100 }),
  confidenceScore: varchar("confidenceScore", { length: 10 }), // "85%"
  
  // User feedback
  userFeedback: mysqlEnum("userFeedback", ["helpful", "not_helpful"]),
  
  // Voice features
  audioUrl: varchar("audioUrl", { length: 500 }),
  personalityVoice: text("personalityVoice"),
  
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;

/**
 * Reminders table for medication, vet appointments, grooming, etc.
 */
export const reminders = mysqlTable("reminders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  petId: varchar("petId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["medication", "vet", "grooming", "training", "custom"]).notNull(),
  dueDate: timestamp("dueDate").notNull(),
  isRecurring: mysqlEnum("isRecurring", ["none", "daily", "weekly", "monthly", "yearly"]).default("none").notNull(),
  isCompleted: mysqlEnum("isCompleted", ["no", "yes"]).default("no").notNull(),
  notificationSent: mysqlEnum("notificationSent", ["no", "yes"]).default("no").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  completedAt: timestamp("completedAt"),
});

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

/**
 * Credit purchases table
 */
export const purchases = mysqlTable("purchases", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  amount: int("amount").notNull(), // Amount in cents
  credits: int("credits").notNull(), // Number of credits purchased
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;


/**
 * Shelter Partners - Organizations that refer adopters to InterpWhat
 */
export const shelterPartners = mysqlTable("shelter_partners", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zip: varchar("zip", { length: 20 }),
  website: varchar("website", { length: 255 }),
  status: mysqlEnum("status", ["pending", "active", "inactive"]).default("pending").notNull(),
  partnershipType: mysqlEnum("partnershipType", ["organizational", "enterprise"]).default("organizational").notNull(),
  revenueSharePercentage: decimal("revenueSharePercentage", { precision: 5, scale: 2 }).default("10.00").notNull(),
  totalAdopterSignups: int("totalAdopterSignups").default(0).notNull(),
  totalRevenueShared: decimal("totalRevenueShared", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type ShelterPartner = typeof shelterPartners.$inferSelect;
export type InsertShelterPartner = typeof shelterPartners.$inferInsert;

/**
 * Adoption Verifications - Verify rescue pet adoptions for lifetime discount
 */
export const adoptionVerifications = mysqlTable("adoption_verifications", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  shelterPartnerId: int("shelterPartnerId").references(() => shelterPartners.id, { onDelete: "set null" }),
  adoptionDate: date("adoptionDate"),
  petName: varchar("petName", { length: 100 }),
  petType: mysqlEnum("petType", ["dog", "cat", "other"]),
  paperworkUrl: varchar("paperworkUrl", { length: 500 }),
  status: mysqlEnum("status", ["pending", "verified", "rejected"]).default("pending").notNull(),
  verifiedAt: timestamp("verifiedAt"),
  verifiedBy: int("verifiedBy"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type AdoptionVerification = typeof adoptionVerifications.$inferSelect;
export type InsertAdoptionVerification = typeof adoptionVerifications.$inferInsert;

/**
 * Email Campaigns - Track marketing email campaigns
 */
export const emailCampaigns = mysqlTable("email_campaigns", {
  id: int("id").primaryKey().autoincrement(),
  campaignName: varchar("campaignName", { length: 255 }).notNull(),
  campaignType: mysqlEnum("campaignType", ["announcement", "shelter_outreach", "newsletter", "promotional"]).notNull(),
  subject: varchar("subject", { length: 500 }),
  sentCount: int("sentCount").default(0).notNull(),
  openCount: int("openCount").default(0).notNull(),
  clickCount: int("clickCount").default(0).notNull(),
  conversionCount: int("conversionCount").default(0).notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = typeof emailCampaigns.$inferInsert;

/**
 * Email Recipients - Track individual email sends and engagement
 */
export const emailRecipients = mysqlTable("email_recipients", {
  id: int("id").primaryKey().autoincrement(),
  campaignId: int("campaignId").notNull().references(() => emailCampaigns.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 255 }).notNull(),
  userId: varchar("userId", { length: 64 }).references(() => users.id, { onDelete: "set null" }),
  shelterPartnerId: int("shelterPartnerId").references(() => shelterPartners.id, { onDelete: "set null" }),
  status: mysqlEnum("status", ["sent", "opened", "clicked", "bounced", "unsubscribed"]).default("sent").notNull(),
  sentAt: timestamp("sentAt").defaultNow(),
  openedAt: timestamp("openedAt"),
  clickedAt: timestamp("clickedAt"),
});

export type EmailRecipient = typeof emailRecipients.$inferSelect;
export type InsertEmailRecipient = typeof emailRecipients.$inferInsert;

/**
 * Analytics Events - General event tracking for admin dashboard
 */
export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").primaryKey().autoincrement(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  userId: varchar("userId", { length: 64 }).references(() => users.id, { onDelete: "set null" }),
  shelterPartnerId: int("shelterPartnerId").references(() => shelterPartners.id, { onDelete: "set null" }),
  eventData: json("eventData"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

