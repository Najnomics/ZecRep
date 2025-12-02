/**
 * Validation utilities for prover inputs and outputs.
 */

import { logger } from "../lib/logger.js";

/**
 * Validate Ethereum address format.
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate and normalize Ethereum address.
 */
export function normalizeAddress(address: string): string {
  if (!isValidAddress(address)) {
    throw new Error(`Invalid Ethereum address: ${address}`);
  }
  return address.toLowerCase();
}

/**
 * Validate viewing key format (basic check).
 */
export function isValidViewingKey(viewingKey: string): boolean {
  // Viewing keys are typically base58 or hex encoded strings
  // This is a basic validation - actual format depends on Zcash protocol
  return viewingKey.length >= 10 && viewingKey.length <= 200;
}

/**
 * Validate zatoshi amount is within reasonable bounds.
 */
export function isValidZatoshiAmount(zatoshis: bigint): boolean {
  const min = 0n;
  const max = BigInt(21_000_000) * BigInt(100_000_000); // 21M ZEC max supply
  return zatoshis >= min && zatoshis <= max;
}

/**
 * Validate tier name.
 */
export function isValidTier(tier: string): tier is "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" {
  return ["BRONZE", "SILVER", "GOLD", "PLATINUM"].includes(tier);
}

/**
 * Validate proof hash format.
 */
export function isValidProofHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validate and sanitize prover input.
 */
export interface ProverInput {
  address: string;
  viewingKey: string;
  seed?: string;
}

export function validateProverInput(input: ProverInput): ProverInput {
  const validated: ProverInput = {
    address: normalizeAddress(input.address),
    viewingKey: input.viewingKey,
  };

  if (!isValidViewingKey(validated.viewingKey)) {
    if (input.seed) {
      logger.warn("Viewing key format may be invalid, will use seed for derivation");
      validated.seed = input.seed;
    } else {
      throw new Error("Invalid viewing key format");
    }
  }

  return validated;
}

/**
 * Validate scan result.
 */
export interface ScanResult {
  saplingZats: bigint;
  orchardZats: bigint;
  notes: number;
}

export function validateScanResult(result: ScanResult): void {
  if (!isValidZatoshiAmount(result.saplingZats)) {
    throw new Error(`Invalid Sapling amount: ${result.saplingZats}`);
  }

  if (!isValidZatoshiAmount(result.orchardZats)) {
    throw new Error(`Invalid Orchard amount: ${result.orchardZats}`);
  }

  if (result.notes < 0 || result.notes > 1_000_000) {
    throw new Error(`Invalid note count: ${result.notes}`);
  }

  const total = result.saplingZats + result.orchardZats;
  if (!isValidZatoshiAmount(total)) {
    throw new Error(`Invalid total amount: ${total}`);
  }
}

