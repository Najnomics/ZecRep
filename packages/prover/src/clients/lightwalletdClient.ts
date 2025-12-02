/**
 * Real lightwalletd gRPC client implementation.
 * 
 * This module provides a typed client for interacting with lightwalletd
 * using the gRPC service definitions from CONTEXT/lightwallet-protocol.
 * 
 * TODO: Generate TypeScript types from .proto files for full type safety
 */

import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { ProverEnv } from "../config.js";
import { logger } from "../lib/logger.js";
import {
  createCredentials,
  createMetadata,
  getConnectionAddress,
  parseGrpcUrl,
  handleGrpcError,
} from "./grpc.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to proto files (relative to this file's location)
const PROTO_PATH = join(__dirname, "../../../CONTEXT/lightwallet-protocol/walletrpc/service.proto");
const COMPACT_FORMATS_PATH = join(__dirname, "../../../CONTEXT/lightwallet-protocol/walletrpc/compact_formats.proto");

/**
 * Load lightwalletd service definitions from proto files.
 */
function loadServiceDefinitions() {
  const packageDefinition = protoLoader.loadSync([PROTO_PATH, COMPACT_FORMATS_PATH], {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [join(__dirname, "../../../CONTEXT/lightwallet-protocol")],
  });

  const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
  const walletrpc = protoDescriptor.cash?.z?.wallet?.sdk?.rpc;
  
  if (!walletrpc) {
    throw new Error("Failed to load lightwalletd proto definitions");
  }

  return walletrpc;
}

/**
 * Lightwalletd client wrapper with typed methods.
 */
export class LightwalletdClient {
  private client: any; // TODO: Replace with generated types
  private service: any;
  private env: ProverEnv;

  constructor(env: ProverEnv) {
    this.env = env;
    
    try {
      const walletrpc = loadServiceDefinitions();
      this.service = walletrpc.CompactTxStreamer;
      
      const { host, port, secure } = parseGrpcUrl(env.LIGHTWALLETD_URL);
      const address = `${host}:${port}`;
      const credentials = createCredentials(secure);
      
      this.client = new this.service(address, credentials, {
        "grpc.keepalive_time_ms": 30000,
        "grpc.keepalive_timeout_ms": 5000,
      });

      logger.info({ address, secure }, "Initialized lightwalletd gRPC client");
    } catch (error) {
      handleGrpcError(error, "LightwalletdClient constructor");
    }
  }

  /**
   * Get info about the lightwalletd instance.
   */
  async getLightdInfo(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.GetLightdInfo({}, createMetadata(this.env), (error: any, response: any) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  }

  /**
   * Stream compact blocks for a given height range.
   * 
   * @param startHeight - Starting block height (inclusive)
   * @param endHeight - Ending block height (inclusive)
   * @param poolTypes - Optional pool types filter (defaults to Sapling + Orchard)
   */
  async getBlockRange(
    startHeight: number,
    endHeight: number,
    poolTypes: string[] = ["SAPLING", "ORCHARD"]
  ): Promise<any[]> {
    const poolTypeMap: Record<string, number> = {
      TRANSPARENT: 1,
      SAPLING: 2,
      ORCHARD: 3,
    };

    const request = {
      start: { height: startHeight },
      end: { height: endHeight },
      poolTypes: poolTypes.map((p) => poolTypeMap[p] ?? 2),
    };

    logger.debug({ request }, "Requesting block range from lightwalletd");

    return new Promise((resolve, reject) => {
      const blocks: any[] = [];
      const call = this.client.GetBlockRange(request, createMetadata(this.env));

      call.on("data", (block: any) => {
        blocks.push(block);
        logger.debug({ height: block.height, txCount: block.vtx?.length }, "Received compact block");
      });

      call.on("error", (error: any) => {
        logger.error({ error }, "Error streaming blocks");
        reject(error);
      });

      call.on("end", () => {
        logger.info({ blockCount: blocks.length, range: `${startHeight}-${endHeight}` }, "Block range stream complete");
        resolve(blocks);
      });
    });
  }

  /**
   * Get UTXOs for a transparent address.
   */
  async getAddressUtxos(address: string, startHeight?: number): Promise<any[]> {
    const request: any = {
      addresses: [address],
    };
    
    if (startHeight !== undefined) {
      request.startHeight = startHeight;
    }

    return new Promise((resolve, reject) => {
      this.client.GetAddressUtxos(request, createMetadata(this.env), (error: any, response: any) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response.addressUtxos || []);
      });
    });
  }

  /**
   * Close the gRPC connection.
   */
  close(): void {
    if (this.client) {
      this.client.close();
      logger.debug("Closed lightwalletd gRPC connection");
    }
  }
}

