/**
 * Metrics collection for aggregator service using prom-client.
 * 
 * Tracks:
 * - Job processing times
 * - Tier query counts
 * - Error rates
 * - Active connections
 */

import { Registry, Counter, Histogram, Gauge } from "prom-client";

export const register = new Registry();

// Job metrics
export const jobsCreatedTotal = new Counter({
  name: "zecrep_jobs_created_total",
  help: "Total number of jobs created",
  labelNames: ["tier"],
  registers: [register],
});

export const jobsCompletedTotal = new Counter({
  name: "zecrep_jobs_completed_total",
  help: "Total number of jobs completed",
  labelNames: ["tier", "status"],
  registers: [register],
});

export const jobDurationSeconds = new Histogram({
  name: "zecrep_job_duration_seconds",
  help: "Job processing duration in seconds",
  labelNames: ["tier"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  registers: [register],
});

export const jobsInProgress = new Gauge({
  name: "zecrep_jobs_in_progress",
  help: "Number of jobs currently being processed",
  labelNames: ["status"],
  registers: [register],
});

// Tier metrics
export const tierQueriesTotal = new Counter({
  name: "zecrep_tier_queries_total",
  help: "Total number of tier queries",
  registers: [register],
});

// Error metrics
export const errorsTotal = new Counter({
  name: "zecrep_errors_total",
  help: "Total number of errors",
  labelNames: ["component", "error_type"],
  registers: [register],
});

// HTTP metrics
export const httpRequestsTotal = new Counter({
  name: "zecrep_http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
  registers: [register],
});

export const httpRequestDurationSeconds = new Histogram({
  name: "zecrep_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Helper functions for common metrics
export function recordJobCreated(tier: string): void {
  jobsCreatedTotal.inc({ tier });
}

export function recordJobCompleted(tier: string, duration: number, status: string = "completed"): void {
  jobsCompletedTotal.inc({ tier, status });
  jobDurationSeconds.observe({ tier }, duration);
}

export function recordTierQuery(): void {
  tierQueriesTotal.inc();
}

export function recordError(component: string, errorType: string): void {
  errorsTotal.inc({ component, error_type: errorType });
}

