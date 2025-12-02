import type { FastifyInstance } from "fastify";
import { metrics } from "../lib/metrics.js";

/**
 * Metrics endpoint for Prometheus scraping.
 * Exposes job counts, durations, tier queries, and error rates.
 */
export async function registerMetricsRoutes(fastify: FastifyInstance) {
  fastify.get("/metrics", async (request, reply) => {
    reply.header("Content-Type", "text/plain; version=0.0.4");
    
    const data = metrics.getMetrics();
    const lines: string[] = [];

    // Export counters
    for (const [key, value] of Object.entries(data.counters as Record<string, number>)) {
      lines.push(`# TYPE ${key.replace(/[{}]/g, "_")} counter`);
      lines.push(`${key.replace(/[{}]/g, "_")} ${value}`);
    }

    // Export gauges
    for (const [key, value] of Object.entries(data.gauges as Record<string, number>)) {
      lines.push(`# TYPE ${key.replace(/[{}]/g, "_")} gauge`);
      lines.push(`${key.replace(/[{}]/g, "_")} ${value}`);
    }

    // Export histogram summaries
    for (const [key, stats] of Object.entries(data.histograms as Record<string, unknown>)) {
      const s = stats as { count: number; sum: number; min: number; max: number; avg: number };
      lines.push(`# TYPE ${key.replace(/[{}]/g, "_")}_summary summary`);
      lines.push(`${key.replace(/[{}]/g, "_")}_count ${s.count}`);
      lines.push(`${key.replace(/[{}]/g, "_")}_sum ${s.sum}`);
      lines.push(`${key.replace(/[{}]/g, "_")}_min ${s.min}`);
      lines.push(`${key.replace(/[{}]/g, "_")}_max ${s.max}`);
      lines.push(`${key.replace(/[{}]/g, "_")}_avg ${s.avg}`);
    }

    return lines.join("\n");
  });
}

