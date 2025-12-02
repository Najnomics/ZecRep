import type { FastifyInstance } from "fastify";
import { storage } from "../services/storage.js";

/**
 * Statistics and analytics endpoints for ZecRep.
 */
export async function registerStatsRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/stats
   * Get overall statistics about the ZecRep system.
   */
  fastify.get("/api/stats", async () => {
    const stats = await storage.getStats();
    
    return {
      stats: {
        ...stats,
        timestamp: new Date().toISOString(),
      },
    };
  });

  /**
   * GET /api/stats/tiers
   * Get tier distribution statistics.
   */
  fastify.get("/api/stats/tiers", async () => {
    const stats = await storage.getStats();
    
    return {
      distribution: stats.tiersByTier,
      total: stats.totalTiers,
      timestamp: new Date().toISOString(),
    };
  });

  /**
   * GET /api/stats/jobs
   * Get job processing statistics.
   */
  fastify.get("/api/stats/jobs", async () => {
    const stats = await storage.getStats();
    
    return {
      byStatus: stats.jobsByStatus,
      total: stats.totalJobs,
      timestamp: new Date().toISOString(),
    };
  });
}

