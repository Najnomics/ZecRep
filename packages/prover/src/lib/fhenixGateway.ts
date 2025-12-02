import { fetch } from "undici";
import type { InEuint64 } from "./fhe.js";
import { formatInEuint64 } from "./fhe.js";

export type FhenixEncryptRequest = {
  value: string; // uint64 as string
  type: "euint64";
};

export type FhenixEncryptResponse = {
  ciphertext: string; // hex-encoded
  securityZone?: number;
};

/**
 * Encrypts a uint64 value via the Fhenix gateway API.
 * Returns an inEuint64 struct ready for contract submission.
 */
export async function encryptViaFhenix(
  gatewayUrl: string,
  value: bigint | number
): Promise<InEuint64> {
  const num = typeof value === "bigint" ? value : BigInt(value);
  const request: FhenixEncryptRequest = {
    value: num.toString(),
    type: "euint64",
  };

  const response = await fetch(`${gatewayUrl}/v1/encrypt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Fhenix encryption failed: ${response.status} ${text}`);
  }

  const result = (await response.json()) as FhenixEncryptResponse;
  const ciphertext = Buffer.from(result.ciphertext.replace("0x", ""), "hex");

  return formatInEuint64(ciphertext, result.securityZone ?? 0);
}

