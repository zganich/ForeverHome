import type { Express } from "express";
import { getDb } from "../db";
import { users, shelterPartners, adoptionVerifications, emailCampaigns, emailRecipients } from "../../drizzle/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export function registerAdminRoutes(app: Express) {
  // Admin analytics endpoint (protected - add auth middleware in production)
  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }

      // Check if user is admin (add proper auth check)
      // For now, this is a placeholder - implement proper admin auth
      
      // Get total users
      const totalUsersResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);
      const totalUsers = Number(totalUsersResult[0]?.count || 0);

      // Get active subscriptions by type (using users table for now)
      const activeSubsResult = await db
        .select({
          plan: users.subscriptionPlan,
          status: users.subscriptionStatus,
          count: sql<number>`count(*)`,
        })
        .from(users)
        .where(eq(users.subscriptionStatus, 'active'))
        .groupBy(users.subscriptionPlan);

      // Calculate revenue by plan type
      let premiumRevenue = 0;
      let essentialRevenue = 0;
      let rescueRevenue = 0;
      let shelterOrgRevenue = 0;
      let activeSubscriptions = 0;
      let rescueAdopters = 0;

      activeSubsResult.forEach(sub => {
        const count = Number(sub.count);
        activeSubscriptions += count;

        if (sub.plan === 'premium') {
          premiumRevenue = count * 19.99;
        } else if (sub.plan === 'essential') {
          essentialRevenue = count * 9.99;
        } else if (sub.plan === 'rescue_adopter') {
          rescueRevenue = count * 14.99;
          rescueAdopters = count;
        } else if (sub.plan === 'shelter_org') {
          shelterOrgRevenue = count * 33;
        }
      });

      const totalRevenue = premiumRevenue + essentialRevenue + rescueRevenue + shelterOrgRevenue;

      // Get shelter partners count
      const shelterPartnersResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(shelterPartners)
        .where(eq(shelterPartners.status, 'active'));
      const shelterPartnersCount = Number(shelterPartnersResult[0]?.count || 0);

      // Get total adopter sign-ups
      const adopterSignupsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(adoptionVerifications)
        .where(eq(adoptionVerifications.status, 'approved'));
      const totalAdopterSignups = Number(adopterSignupsResult[0]?.count || 0);

      // Calculate shelter revenue share (10% of rescue adopter revenue)
      const shelterRevenueShare = rescueRevenue * 0.10;

      // Calculate average lifetime value (simplified - 12 months avg)
      const avgLifetimeValue = activeSubscriptions > 0 
        ? (totalRevenue / activeSubscriptions) * 12 
        : 0;

      // Mock data for growth and churn (implement real calculations)
      const monthlyGrowth = 15.3; // Placeholder
      const churnRate = 5.2; // Placeholder
      const avgSignupRate = 18.5; // Placeholder

      // Get recent activity (mock for now - implement real activity tracking)
      const recentActivity = [
        {
          type: "New Subscription",
          user: "user@example.com",
          value: "Premium",
          timestamp: "2 hours ago"
        },
        {
          type: "Adoption Verified",
          user: "adopter@example.com",
          value: "Rescue Adopter",
          timestamp: "5 hours ago"
        },
        {
          type: "Shelter Partnership",
          user: "Austin Pets Alive!",
          value: "Active",
          timestamp: "1 day ago"
        }
      ];

      // Get top performing shelter (mock for now)
      const topShelter = "Austin Pets Alive!";

      res.json({
        totalUsers,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        activeSubscriptions,
        rescueAdopters,
        shelterPartners: shelterPartnersCount,
        monthlyGrowth,
        churnRate,
        avgLifetimeValue: Math.round(avgLifetimeValue * 100) / 100,
        premiumRevenue: Math.round(premiumRevenue * 100) / 100,
        essentialRevenue: Math.round(essentialRevenue * 100) / 100,
        rescueRevenue: Math.round(rescueRevenue * 100) / 100,
        shelterOrgRevenue: Math.round(shelterOrgRevenue * 100) / 100,
        totalAdopterSignups,
        shelterRevenueShare: Math.round(shelterRevenueShare * 100) / 100,
        avgSignupRate,
        topShelter,
        recentActivity
      });
    } catch (error) {
      console.error("Error fetching admin analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Export data endpoint
  app.get("/api/admin/export", async (req, res) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }

      // Add proper admin auth check here
      
      const { type } = req.query;

      if (type === 'users') {
        const userList = await db.select().from(users);
        res.json(userList);
      } else if (type === 'shelters') {
        const shelters = await db.select().from(shelterPartners);
        res.json(shelters);
      } else if (type === 'adopters') {
        const adopters = await db.select().from(adoptionVerifications);
        res.json(adopters);
      } else {
        res.status(400).json({ error: "Invalid export type" });
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });
}

