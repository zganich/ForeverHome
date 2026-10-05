import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 5 });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.id,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== PET QUERIES =====

import { analyses, pets, InsertPet, Pet, InsertAnalysis, Analysis } from "../drizzle/schema";
import { nanoid } from "nanoid";
import { desc } from "drizzle-orm";

export async function createPet(userId: string, data: Omit<InsertPet, "id" | "userId">): Promise<Pet> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const pet: InsertPet = {
    id: nanoid(),
    userId,
    ...data,
  };

  await db.insert(pets).values(pet);
  return pet as Pet;
}

export async function getUserPets(userId: string): Promise<Pet[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(pets).where(eq(pets.userId, userId)).orderBy(desc(pets.createdAt));
}

export async function getPet(petId: string): Promise<Pet | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(pets).where(eq(pets.id, petId)).limit(1);
  return result[0];
}

// ===== ANALYSIS QUERIES =====

export async function createAnalysis(data: Omit<InsertAnalysis, "id">): Promise<Analysis> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const analysis: InsertAnalysis = {
    id: nanoid(),
    ...data,
  };

  await db.insert(analyses).values(analysis);
  return analysis as Analysis;
}

export async function getPetAnalyses(petId: string): Promise<Analysis[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(analyses).where(eq(analyses.petId, petId)).orderBy(desc(analyses.createdAt));
}

export async function getAnalysis(analysisId: string): Promise<Analysis | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(analyses).where(eq(analyses.id, analysisId)).limit(1);
  return result[0];
}

export async function updateAnalysisFeedback(
  analysisId: string,
  feedback: "helpful" | "not_helpful"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(analyses).set({ userFeedback: feedback }).where(eq(analyses.id, analysisId));
}

// ===== FEEDBACK QUERIES =====

import { feedback, InsertFeedback, Feedback } from "../drizzle/schema";

export async function createFeedback(data: Omit<InsertFeedback, "id">): Promise<Feedback> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const feedbackEntry: InsertFeedback = {
    id: nanoid(),
    ...data,
  };

  await db.insert(feedback).values(feedbackEntry);
  return feedbackEntry as Feedback;
}

export async function getUserFeedback(userId: string): Promise<Feedback[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(feedback).where(eq(feedback.userId, userId)).orderBy(desc(feedback.createdAt));
}
