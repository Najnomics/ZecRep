import { createHash } from "node:crypto";

/**
 * Placeholder ZIP-32 unified viewing key derivation.
 * Real implementation will follow the spec from CONTEXT/zip32, but for now we hash the seed.
 */
export function deriveUnifiedViewingKey(seed: string): string {
  const buffer = Buffer.from(seed.replace(/^0x/, ""), "hex");
  const hash = createHash("sha256").update(buffer).digest("hex");
  return `uvk_${hash.slice(0, 64)}`;
}

