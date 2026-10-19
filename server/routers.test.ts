import { publicObjectUrl, userUploadPrefix } from "./storage";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { createMockUser, createMockPet } from "../tests/utils/mocks";
import * as dbModule from "./db";
import * as creditsModule from "./credits";
import type { TrpcContext } from "./_core/context";

// Mock all database and external dependencies
vi.mock("./db", () => ({
  getDb: vi.fn(),
  getUserPets: vi.fn(),
  getPet: vi.fn(),
  createPet: vi.fn(),
  createAnalysis: vi.fn(),
}));

vi.mock("./credits", () => ({
  getUserCredits: vi.fn(),
  deductCredits: vi.fn(),
  reserveAnalysisCredit: vi.fn(),
  refundAnalysisCredit: vi.fn(),
  isBetaTester: vi.fn(),
  hasUnlimitedCredits: vi.fn().mockReturnValue(false),
}));

vi.mock("./aiAgents", () => ({
  analyzeBehavior: vi.fn().mockResolvedValue({
    vision: { description: "Happy pet" },
    context: { breed: "Persian" },
    synthesis: {
      primaryBehavior: "Happy and playful",
      confidence: 95,
    },
    recommendations: [{ text: "Continue current care routine" }],
  }),
}));

vi.mock("./breedIdentification", () => ({
  identifyBreed: vi.fn().mockResolvedValue({
    primaryBreed: "Persian",
    confidence: "high",
  }),
}));

vi.mock("./photoQuality", () => ({
  validatePhotoQuality: vi.fn().mockResolvedValue({
    isAcceptable: true,
    score: 95,
    issues: [],
    suggestions: [],
    canProceed: true,
  }),
  getPhotoTips: vi.fn().mockReturnValue([]),
}));

describe("tRPC Routers - Integration Tests", () => {
  const mockUser = createMockUser();
  const mockPet = createMockPet();

  const mockContext: TrpcContext = {
    user: mockUser,
    req: {} as any,
    res: {} as any,
  };

  // Create caller helper function
  const createCaller = (ctx: TrpcContext) => {
    return appRouter.createCaller(ctx);
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(creditsModule.getUserCredits).mockResolvedValue(10);
    vi.mocked(creditsModule.deductCredits).mockResolvedValue(true);
    vi.mocked(creditsModule.reserveAnalysisCredit).mockResolvedValue({
      allowed: true,
      charged: true,
    });
    vi.mocked(creditsModule.isBetaTester).mockResolvedValue(false);
  });

  describe("pets.create", () => {
    test("creates pet with valid data", async () => {
      const caller = appRouter.createCaller(mockContext);

      vi.mocked(dbModule.createPet).mockResolvedValue(mockPet as any);

      const result = await caller.pets.create({
        name: "Fluffy",
        species: "cat",
        breed: "Persian",
        age: "2",
      });

      expect(result).toBeDefined();
      expect(result.name).toBe("Fluffy");
      expect(dbModule.createPet).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          name: "Fluffy",
          species: "cat",
        })
      );
    });

    test("rejects pet creation without name", async () => {
      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.pets.create({
          name: "",
          species: "cat",
        } as any)
      ).rejects.toThrow();
    });
  });

  describe("pets.list", () => {
    test("returns user's pets", async () => {
      const caller = appRouter.createCaller(mockContext);
      const pets = [mockPet, { ...mockPet, id: "pet-2", name: "Buddy" }];

      vi.mocked(dbModule.getUserPets).mockResolvedValue(pets as any);

      const result = await caller.pets.list();

      expect(result).toEqual(pets);
      expect(dbModule.getUserPets).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe("pets.identifyBreed", () => {
    test("identifies breed from image", async () => {
      const caller = appRouter.createCaller(mockContext);

      const result = await caller.pets.identifyBreed({
        imageUrl: publicObjectUrl(
          `${userUploadPrefix(mockUser.id)}fictional.jpg`
        ),
        species: "cat",
      });

      expect(result.primaryBreed).toBe("Persian");
      expect(result.confidence).toBe("high");
    });
  });

  describe("analysis.validatePhoto", () => {
    test("validates photo quality", async () => {
      const caller = appRouter.createCaller(mockContext);

      const result = await caller.analysis.validatePhoto({
        imageUrl: publicObjectUrl(
          `${userUploadPrefix(mockUser.id)}fictional.jpg`
        ),
      });

      expect(result.isAcceptable).toBe(true);
      expect(result.score).toBe(95);
      expect(result.canProceed).toBe(true);
    });
  });

  describe("analysis.create", () => {
    test("creates analysis successfully", async () => {
      const caller = appRouter.createCaller(mockContext);

      vi.mocked(dbModule.getPet).mockResolvedValue(mockPet as any);
      vi.mocked(dbModule.createAnalysis).mockResolvedValue({
        id: "analysis-123",
        petId: mockPet.id,
        mediaUrl: publicObjectUrl(
          `${userUploadPrefix(mockUser.id)}fictional.jpg`
        ),
        primaryBehavior: "Happy",
        confidenceScore: "95%",
        createdAt: new Date(),
      } as any);

      const result = await caller.analysis.create({
        petId: mockPet.id,
        mediaUrl: publicObjectUrl(
          `${userUploadPrefix(mockUser.id)}fictional.jpg`
        ),
        mediaType: "image",
      });

      expect(result).toBeDefined();
      expect(result.analysis.id).toBe("analysis-123");
      expect(dbModule.getPet).toHaveBeenCalledWith(mockPet.id);
      // Note: deductCredits is called in the analysis.create handler,
      // but we need to mock it in the actual router implementation
      // For now, we verify the analysis was created successfully
    });

    test("rejects analysis for pet not owned by user", async () => {
      const caller = appRouter.createCaller(mockContext);
      const otherUserPet = { ...mockPet, userId: "other-user-123" };

      vi.mocked(dbModule.getPet).mockResolvedValue(otherUserPet as any);

      await expect(
        caller.analysis.create({
          petId: otherUserPet.id,
          mediaUrl: publicObjectUrl(
            `${userUploadPrefix(mockUser.id)}fictional.jpg`
          ),
          mediaType: "image",
        })
      ).rejects.toThrow("You don't have permission");
    });

    test("rejects analysis when pet not found", async () => {
      const caller = appRouter.createCaller(mockContext);

      vi.mocked(dbModule.getPet).mockResolvedValue(undefined);

      await expect(
        caller.analysis.create({
          petId: "non-existent-pet",
          mediaUrl: publicObjectUrl(
            `${userUploadPrefix(mockUser.id)}fictional.jpg`
          ),
          mediaType: "image",
        })
      ).rejects.toThrow("Pet not found");
    });
  });

  describe("auth.me", () => {
    test("returns current user", async () => {
      const caller = appRouter.createCaller(mockContext);

      const result = await caller.auth.me();

      expect(result).toEqual(mockUser);
    });
  });
});
