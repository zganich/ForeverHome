import { vi } from "vitest";
import type { DrizzleD1Database } from "drizzle-orm/d1";

/**
 * Create a mock file for testing
 */
export function createMockFile(
  name: string,
  type: string,
  size: number
): File {
  const file = new File([], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

/**
 * Create a mock database instance
 */
export function createMockDb() {
  return {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    orderBy: vi.fn().mockReturnThis(),
  } as unknown as DrizzleD1Database;
}

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides?: Partial<any>) {
  return {
    id: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    credits: 10,
    isBetaTester: false,
    lastCreditRefresh: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock pet for testing
 */
export function createMockPet(overrides?: Partial<any>) {
  return {
    id: "test-pet-123",
    userId: "test-user-123",
    name: "Fluffy",
    species: "cat" as const,
    breed: "Persian",
    age: 2,
    photoUrl: "https://example.com/photo.jpg",
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock Stripe instance
 */
export function createMockStripe() {
  return {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: "cs_test_123",
          url: "https://checkout.stripe.com/test",
        }),
      },
    },
    customers: {
      list: vi.fn().mockResolvedValue({ data: [] }),
      create: vi.fn().mockResolvedValue({ id: "cus_test_123" }),
    },
    webhooks: {
      constructEvent: vi.fn().mockReturnValue({
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_123",
            client_reference_id: "test-user-123",
            metadata: {},
          },
        },
      }),
    },
  };
}

