/**
 * Metrics collection for aggregator service.
 * 
 * Tracks:
 * - Job processing times
 * - Tier query counts
 * - Error rates
 * - Active connections
 */

export type MetricType = "counter" | "gauge" | "histogram" | "summary";

export type MetricLabels = Record<string, string | number>;

class MetricsCollector {
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();
  private histograms = new Map<string, number[]>();

  increment(name: string, labels?: MetricLabels, value = 1): void {
    const key = this.getKey(name, labels);
    this.counters.set(key, (this.counters.get(key) ?? 0) + value);
  }

  setGauge(name: string, value: number, labels?: MetricLabels): void {
    const key = this.getKey(name, labels);
    this.gauges.set(key, value);
  }

  recordHistogram(name: string, value: number, labels?: MetricLabels): void {
    const key = this.getKey(name, labels);
    const values = this.histograms.get(key) ?? [];
    values.push(value);
    this.histograms.set(key, values);
  }

  getMetrics(): Record<string, unknown> {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: Object.fromEntries(
        Array.from(this.histograms.entries()).map(([k, v]) => [
          k,
          {
            count: v.length,
            sum: v.reduce((a, b) => a + b, 0),
            min: Math.min(...v),
            max: Math.max(...v),
            avg: v.reduce((a, b) => a + b, 0) / v.length,
          },
        ])
      ),
    };
  }

  private getKey(name: string, labels?: MetricLabels): string {
    if (!labels || Object.keys(labels).length === 0) return name;
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}=${v}`)
      .join(",");
    return `${name}{${labelStr}}`;
  }
}

export const metrics = new MetricsCollector();

// Helper functions for common metrics
export function recordJobCreated(tier: string): void {
  metrics.increment("zecrep_jobs_created_total", { tier });
}

export function recordJobCompleted(tier: string, duration: number): void {
  metrics.increment("zecrep_jobs_completed_total", { tier });
  metrics.recordHistogram("zecrep_job_duration_seconds", duration, { tier });
}

export function recordTierQuery(): void {
  metrics.increment("zecrep_tier_queries_total");
}

export function recordError(component: string, error: string): void {
  metrics.increment("zecrep_errors_total", { component, error });
}

