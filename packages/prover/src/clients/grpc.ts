/**
 * gRPC client setup for lightwalletd.
 * 
 * This module provides utilities for creating and managing gRPC connections
 * to the lightwalletd service. For now, we'll use @grpc/grpc-js for Node.js compatibility.
 * 
 * TODO: Add @grpc/proto-loader and generate TypeScript types from proto files
 */

import { ChannelCredentials, Client, ClientOptions, Metadata } from "@grpc/grpc-js";
import type { ProverEnv } from "../config.js";
import { logger } from "../lib/logger.js";

/**
 * Create gRPC metadata with optional authentication.
 */
export function createMetadata(env: ProverEnv): Metadata {
  const metadata = new Metadata();
  
  // Add authentication headers if provided
  if (env.LIGHTWALLETD_USER && env.LIGHTWALLETD_PASSWORD) {
    const auth = Buffer.from(`${env.LIGHTWALLETD_USER}:${env.LIGHTWALLETD_PASSWORD}`).toString("base64");
    metadata.add("authorization", `Basic ${auth}`);
  }
  
  return metadata;
}

/**
 * Create gRPC client options for lightwalletd connection.
 */
export function createClientOptions(env: ProverEnv): ClientOptions {
  return {
    "grpc.keepalive_time_ms": 30000,
    "grpc.keepalive_timeout_ms": 5000,
    "grpc.keepalive_permit_without_calls": 1,
    "grpc.http2.max_pings_without_data": 0,
    "grpc.http2.min_time_between_pings_ms": 10000,
    "grpc.http2.min_ping_interval_without_data_ms": 300000,
  };
}

/**
 * Parse lightwalletd URL to extract host and port.
 * Supports formats:
 * - grpc://hostname:port
 * - https://hostname:port
 * - hostname:port
 */
export function parseGrpcUrl(url: string): { host: string; port: number; secure: boolean } {
  try {
    const parsed = new URL(url.startsWith("grpc://") || url.startsWith("https://") ? url : `grpc://${url}`);
    const host = parsed.hostname;
    const port = parsed.port ? Number.parseInt(parsed.port, 10) : 9067; // Default lightwalletd port
    const secure = parsed.protocol === "https:" || parsed.protocol === "grpcs:";
    
    return { host, port, secure };
  } catch (error) {
    throw new Error(`Invalid lightwalletd URL format: ${url}. Expected format: grpc://hostname:port or hostname:port`);
  }
}

/**
 * Create gRPC channel credentials based on URL scheme.
 */
export function createCredentials(secure: boolean): ChannelCredentials {
  if (secure) {
    // TODO: Add TLS certificate configuration for production
    return ChannelCredentials.createSsl();
  }
  return ChannelCredentials.createInsecure();
}

/**
 * Get gRPC connection address string.
 */
export function getConnectionAddress(env: ProverEnv): string {
  const { host, port } = parseGrpcUrl(env.LIGHTWALLETD_URL);
  return `${host}:${port}`;
}

/**
 * Log gRPC call details for debugging.
 */
export function logGrpcCall(method: string, request: unknown, response?: unknown): void {
  logger.debug({ method, request, response }, "gRPC call");
}

/**
 * Handle gRPC errors with proper logging.
 */
export function handleGrpcError(error: unknown, context: string): never {
  if (error instanceof Error) {
    logger.error({ error: error.message, stack: error.stack, context }, "gRPC error");
    throw new Error(`gRPC error in ${context}: ${error.message}`);
  }
  throw new Error(`Unknown gRPC error in ${context}`);
}

