import { boolean, date, decimal, integer, json, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Define all enums FIRST (PostgreSQL requirement)
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "canceled", "past_due"]);
export const speciesEnum = pgEnum("species", ["dog", "cat", "other"]);
export const personalityEnum = pgEnum("personality", ["goofy", "wise", "sassy", "serious", "excited", "sleepy", "dramatic"]);
export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);
export const userFeedbackEnum = pgEnum("user_feedback", ["helpful", "not_helpful"]);
export const reminderTypeEnum = pgEnum("reminder_type", ["medication", "vet", "grooming", "training", "custom"]);
export const recurringEnum = pgEnum("recurring", ["none", "daily", "weekly", "monthly", "yearly"]);
export const booleanEnum = pgEnum("boolean_enum", ["no", "yes"]);
export const partnerStatusEnum = pgEnum("partner_status", ["pending", "active", "inactive"]);
export const verificationStatusEnum = pgEnum("verification_status", ["pending", "approved", "rejected"]);
export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "scheduled", "sent", "failed"]);
export const feedbackCategoryEnum = pgEnum("feedback_category", ["bug", "feature_request", "ux_improvement", "performance", "content", "other"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  credits: integer("credits").default(3).notNull(),
  isBetaTester: boolean("isBetaTester").default(false).notNull(),
  betaInviteCode: varchar("betaInviteCode", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
  lastCreditRefresh: timestamp("lastCreditRefresh").defaultNow(),
  subscriptionPlan: varchar("subscriptionPlan", { length: 64 }),
  subscriptionStatus: subscriptionStatusEnum("subscriptionStatus"),
  subscriptionEndDate: timestamp("subscriptionEndDate"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Pet profiles
 */
export const pets = pgTable("pets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  species: speciesEnum("species").notNull(),
  breed: varchar("breed", { length: 100 }),
  breedConfidence: varchar("breedConfidence", { length: 20 }),
  breedCandidates: text("breedCandidates"),
  age: varchar("age", { length: 50 }),
  photoUrl: varchar("photoUrl", { length: 500 }),
  notes: text("notes"),
  personality: personalityEnum("personality").default("goofy"),
  voiceStyle: varchar("voiceStyle", { length: 50 }).default("alloy"),
  behaviorPatterns: text("behaviorPatterns"),
  createdAt: timestamp("createdAt").defaultNow(),
});
export type Pet = typeof pets.$inferSelect;
export type InsertPet = typeof pets.$inferInsert;

/**
 * Behavior analyses
 */
export const analyses = pgTable("analyses", {
  id: varchar("id", { length: 64 }).primaryKey(),
  petId: varchar("petId", { length: 64 }).notNull(),
  mediaUrl: text("mediaUrl").notNull(),
  mediaType: mediaTypeEnum("mediaType").notNull(),
  userContext: text("userContext"),
  photoDate: timestamp("photoDate"),
  petAgeAtPhoto: varchar("petAgeAtPhoto", { length: 64 }),
  visionData: text("visionData"),
  contextData: text("contextData"),
  synthesisData: text("synthesisData"),
  recommendations: text("recommendations"),
  primaryBehavior: varchar("primaryBehavior", { length: 100 }),
  confidenceScore: varchar("confidenceScore", { length: 10 }),
  userFeedback: userFeedbackEnum("userFeedback"),
  audioUrl: varchar("audioUrl", { length: 500 }),
  personalityVoice: text("personalityVoice"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;

/**
 * Reminders
 */
export const reminders = pgTable("reminders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  petId: varchar("petId", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: reminderTypeEnum("type").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  isRecurring: recurringEnum("isRecurring").default("none").notNull(),
  isCompleted: booleanEnum("isCompleted").default("no").notNull(),
  notificationSent: booleanEnum("notificationSent").default("no").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  completedAt: timestamp("completedAt"),
  recurringInterval: integer("recurringInterval"),
});

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

/**
 * Purchases
 */
export const purchaseStatusEnum = pgEnum("purchase_status", ["pending", "completed", "failed"]);

export const purchases = pgTable("purchases", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  credits: integer("credits").notNull(),
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  status: purchaseStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

/**
 * Shelter partners
 */
export const shelterPartners = pgTable("shelter_partners", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  contactName: varchar("contactName", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  website: varchar("website", { length: 500 }),
  status: partnerStatusEnum("status").default("pending").notNull(),
  revenueSharePercent: decimal("revenueSharePercent", { precision: 5, scale: 2 }).default("20.00"),
  totalReferrals: integer("totalReferrals").default(0),
  totalRevenue: decimal("totalRevenue", { precision: 10, scale: 2 }).default("0.00"),
  notes: text("notes"),
  apiKey: varchar("apiKey", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type ShelterPartner = typeof shelterPartners.$inferSelect;
export type InsertShelterPartner = typeof shelterPartners.$inferInsert;

/**
 * Adoption verifications
 */
export const adoptionVerifications = pgTable("adoption_verifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  shelterId: varchar("shelterId", { length: 64 }).notNull().references(() => shelterPartners.id),
  petId: varchar("petId", { length: 64 }).references(() => pets.id),
  adoptionDate: date("adoptionDate").notNull(),
  verificationCode: varchar("verificationCode", { length: 64 }).notNull(),
  status: verificationStatusEnum("status").default("pending").notNull(),
  documentUrl: varchar("documentUrl", { length: 500 }),
  notes: text("notes"),
  verifiedAt: timestamp("verifiedAt"),
  verifiedBy: varchar("verifiedBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type AdoptionVerification = typeof adoptionVerifications.$inferSelect;
export type InsertAdoptionVerification = typeof adoptionVerifications.$inferInsert;

/**
 * Email campaigns
 */
export const emailCampaigns = pgTable("email_campaigns", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  bodyHtml: text("bodyHtml").notNull(),
  bodyText: text("bodyText"),
  status: campaignStatusEnum("status").default("draft").notNull(),
  scheduledFor: timestamp("scheduledFor"),
  sentAt: timestamp("sentAt"),
  totalRecipients: integer("totalRecipients").default(0),
  totalSent: integer("totalSent").default(0),
  totalOpened: integer("totalOpened").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = typeof emailCampaigns.$inferInsert;

/**
 * Email recipients
 */
export const emailRecipients = pgTable("email_recipients", {
  id: varchar("id", { length: 64 }).primaryKey(),
  campaignId: varchar("campaignId", { length: 64 }).notNull().references(() => emailCampaigns.id),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  email: varchar("email", { length: 320 }).notNull(),
  sentAt: timestamp("sentAt"),
  openedAt: timestamp("openedAt"),
  clickedAt: timestamp("clickedAt"),
  bouncedAt: timestamp("bouncedAt"),
  unsubscribedAt: timestamp("unsubscribedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type EmailRecipient = typeof emailRecipients.$inferSelect;
export type InsertEmailRecipient = typeof emailRecipients.$inferInsert;

/**
 * Analytics events
 */
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).references(() => users.id),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  eventData: text("eventData"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

/**
 * General user feedback (for Phase 3 beta testing and beyond)
 */
export const feedback = pgTable("feedback", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull().references(() => users.id),
  category: feedbackCategoryEnum("category").notNull(),
  rating: integer("rating"), // 1-5 satisfaction rating
  message: text("message").notNull(),
  pageUrl: varchar("pageUrl", { length: 500 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;

/**
 * Beta invite codes for Phase 1 beta testing program
 */
export const betaCodeStatusEnum = pgEnum("beta_code_status", ["active", "used", "expired", "revoked"]);

export const betaCodes = pgTable("beta_codes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  createdBy: varchar("createdBy", { length: 64 }), // Admin user ID who created it
  maxUses: integer("maxUses").default(1), // How many times this code can be used (1 = single use)
  uses: integer("uses").default(0).notNull(), // Current number of uses
  status: betaCodeStatusEnum("status").default("active").notNull(),
  expiresAt: timestamp("expiresAt"), // Optional expiration date
  notes: text("notes"), // Optional notes about this code
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type BetaCode = typeof betaCodes.$inferSelect;
export type InsertBetaCode = typeof betaCodes.$inferInsert;
