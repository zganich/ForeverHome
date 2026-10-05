import { eq, and, lte, desc } from "drizzle-orm";
import { getDb } from "./db";
import { reminders, type InsertReminder, type Reminder } from "../drizzle/schema";
import { nanoid } from "nanoid";

/**
 * Create a new reminder
 */
export async function createReminder(data: Omit<InsertReminder, "id" | "createdAt">): Promise<Reminder> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const id = nanoid();
  const reminder: InsertReminder = {
    ...data,
    id,
  };

  await db.insert(reminders).values(reminder);
  
  const result = await db.select().from(reminders).where(eq(reminders.id, id)).limit(1);
  return result[0];
}

/**
 * Get all reminders for a user
 */
export async function getUserReminders(userId: string): Promise<Reminder[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db
    .select()
    .from(reminders)
    .where(eq(reminders.userId, userId))
    .orderBy(desc(reminders.dueDate));
}

/**
 * Get reminders for a specific pet
 */
export async function getPetReminders(petId: string): Promise<Reminder[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db
    .select()
    .from(reminders)
    .where(eq(reminders.petId, petId))
    .orderBy(desc(reminders.dueDate));
}

/**
 * Get upcoming reminders (due within next 7 days, not completed)
 */
export async function getUpcomingReminders(userId: string): Promise<Reminder[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  return db
    .select()
    .from(reminders)
    .where(
      and(
        eq(reminders.userId, userId),
        eq(reminders.isCompleted, "no"),
        lte(reminders.dueDate, sevenDaysFromNow)
      )
    )
    .orderBy(reminders.dueDate);
}

/**
 * Mark reminder as completed
 */
export async function completeReminder(reminderId: string, userId: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(reminders)
    .set({
      isCompleted: "yes",
      completedAt: new Date(),
    })
    .where(and(eq(reminders.id, reminderId), eq(reminders.userId, userId)));
}

/**
 * Delete a reminder
 */
export async function deleteReminder(reminderId: string, userId: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(reminders).where(and(eq(reminders.id, reminderId), eq(reminders.userId, userId)));
}

/**
 * Update a reminder
 */
export async function updateReminder(
  reminderId: string,
  data: Partial<Omit<InsertReminder, "id" | "userId" | "createdAt">>
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(reminders).set(data).where(eq(reminders.id, reminderId));
}

