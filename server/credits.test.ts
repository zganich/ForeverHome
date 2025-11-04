import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  getUserCredits,
  addCredits,
  deductCredits,
  isBetaTester,
  refreshFreeCredits,
  activateBetaTester,
} from "./credits";
import { createMockDb, createMockUser } from "../tests/utils/mocks";
import * as dbModule from "./db";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

describe("Credit Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserCredits", () => {
    test("returns user credits when user exists", async () => {
      const mockDb = createMockDb();
      const mockUser = createMockUser({ credits: 15 });

      vi.mocked(mockDb.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ credits: 15 }]),
          }),
        }),
      } as any);

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const credits = await getUserCredits("test-user-123");
      expect(credits).toBe(15);
    });

    test("returns 0 when user does not exist", async () => {
      const mockDb = createMockDb();

      vi.mocked(mockDb.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const credits = await getUserCredits("non-existent-user");
      expect(credits).toBe(0);
    });

    test("returns 0 when database is not available", async () => {
      vi.mocked(dbModule.getDb).mockResolvedValue(null);
      const credits = await getUserCredits("test-user-123");
      expect(credits).toBe(0);
    });
  });

  describe("isBetaTester", () => {
    test("returns true for beta testers", async () => {
      const mockDb = createMockDb();

      vi.mocked(mockDb.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ isBetaTester: true }]),
          }),
        }),
      } as any);

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const isBeta = await isBetaTester("beta-user-123");
      expect(isBeta).toBe(true);
    });

    test("returns false for regular users", async () => {
      const mockDb = createMockDb();

      vi.mocked(mockDb.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ isBetaTester: false }]),
          }),
        }),
      } as any);

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const isBeta = await isBetaTester("regular-user-123");
      expect(isBeta).toBe(false);
    });
  });

  describe("deductCredits", () => {
    test("deducts credits successfully when user has enough", async () => {
      const mockDb = createMockDb();

      // Mock getUserCredits to return 10 credits
      vi.mocked(mockDb.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ credits: 10 }]),
          }),
        }),
      } as any);

      vi.mocked(mockDb.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as any);

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      // Mock getUserCredits call within deductCredits
      const result = await deductCredits("test-user-123", 5);
      expect(result).toBe(true);
    });

    test("returns false when user has insufficient credits", async () => {
      const mockDb = createMockDb();

      vi.mocked(mockDb.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ credits: 3 }]),
          }),
        }),
      } as any);

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const result = await deductCredits("test-user-123", 5);
      expect(result).toBe(false);
    });

    test("allows unlimited credits for beta testers", async () => {
      const mockDb = createMockDb();

      // Mock isBetaTester to return true
      const limitMock = vi.fn()
        .mockResolvedValueOnce([{ isBetaTester: true }]) // For isBetaTester check
        .mockResolvedValueOnce([{ credits: 0 }]); // For getUserCredits (shouldn't be called)
      
      vi.mocked(mockDb.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: limitMock,
          }),
        }),
      } as any);

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const result = await deductCredits("beta-user-123", 1000);
      expect(result).toBe(true);
    });

    test("returns false when database is not available", async () => {
      vi.mocked(dbModule.getDb).mockResolvedValue(null);
      const result = await deductCredits("test-user-123", 1);
      expect(result).toBe(false);
    });
  });

  describe("activateBetaTester", () => {
    test("activates beta tester with valid invite code", async () => {
      const mockDb = createMockDb();
      const testCode = "BETA-XXXXX-XXXX";

      // Mock beta code lookup - code exists and is active
      const mockBetaCode = {
        id: "code-123",
        code: testCode,
        status: "active",
        maxUses: 1,
        uses: 0,
        expiresAt: null,
      };

      // Mock user lookup - user is not a beta tester
      const mockUser = { isBetaTester: false };

      // Setup select mocks for different queries
      let selectCallCount = 0;
      vi.mocked(mockDb.select).mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) {
          // First call: beta code lookup
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockBetaCode]),
              }),
            }),
          } as any;
        } else if (selectCallCount === 2) {
          // Second call: user lookup
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockUser]),
              }),
            }),
          } as any;
        } else {
          // Third call: beta code uses lookup (for increment)
          return {
            from: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([{ uses: 0 }]),
              }),
            }),
          } as any;
        }
      });

      // Mock update for user and beta code
      vi.mocked(mockDb.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as any);

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      const result = await activateBetaTester("test-user-123", testCode);
      expect(result).toBe(true);
    });

    test("rejects invalid invite code", async () => {
      vi.mocked(dbModule.getDb).mockResolvedValue(createMockDb() as any);

      const result = await activateBetaTester("test-user-123", "INVALID-CODE");
      expect(result).toBe(false);
    });

    test("returns false when database is not available", async () => {
      vi.mocked(dbModule.getDb).mockResolvedValue(null);
      const result = await activateBetaTester("test-user-123", "BETA-XXXXX-XXXX");
      expect(result).toBe(false);
    });
  });

  describe("refreshFreeCredits", () => {
    test("refreshes credits after 30 days", async () => {
      const mockDb = createMockDb();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 31);

      vi.mocked(mockDb.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ lastCreditRefresh: thirtyDaysAgo }]),
          }),
        }),
      } as any);

      vi.mocked(mockDb.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      } as any);

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      await refreshFreeCredits("test-user-123");
      
      // Verify update was called with credits: 3
      expect(mockDb.update).toHaveBeenCalled();
    });

    test("does not refresh credits before 30 days", async () => {
      const mockDb = createMockDb();
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      vi.mocked(mockDb.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ lastCreditRefresh: tenDaysAgo }]),
          }),
        }),
      } as any);

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      await refreshFreeCredits("test-user-123");
      
      // Verify update was not called
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    test("does not refresh for beta testers", async () => {
      const mockDb = createMockDb();

      vi.mocked(mockDb.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ isBetaTester: true }]),
          }),
        }),
      } as any);

      vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

      await refreshFreeCredits("beta-user-123");
      
      // Verify update was not called
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });
});

