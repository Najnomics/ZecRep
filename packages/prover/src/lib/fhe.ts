/**
 * FHE (Fully Homomorphic Encryption) utilities for ZecRep.
 * Handles encryption formatting compatible with Fhenix/Cofhe contracts.
 * 
 * Based on CONTEXT/cofhe-docs/docs/devdocs/cofhejs/encryption-operations.md
 * 
 * The inEuint64 struct matches the Solidity contract format:
 * - data: bytes (encrypted ciphertext)
 * - securityZone: uint8 (security zone identifier)
 */

export type InEuint64 = {
  data: string; // hex-encoded bytes (matches Solidity bytes calldata)
  securityZone: number; // uint8
};

/**
 * Formats a ciphertext for submission to ZecRepRegistry.submitProof.
 * Returns an inEuint64 struct compatible with Fhenix contracts.
 * 
 * When using cofhejs, the encryption result (CoFheInUint64) has:
 * - ctHash: bigint (handle to encrypted value)
 * - securityZone: number
 * - utype: FheTypes.Uint64
 * - signature: string
 * 
 * This function converts the cofhejs format to the Solidity contract format.
 */
export function formatInEuint64(ciphertext: Uint8Array, securityZone = 0): InEuint64 {
  return {
    data: `0x${Buffer.from(ciphertext).toString("hex")}`,
    securityZone,
  };
}

/**
 * Encodes inEuint64 for ABI encoding (for contract calls).
 */
export function encodeInEuint64(input: InEuint64): { data: string; securityZone: number } {
  return {
    data: input.data,
    securityZone: input.securityZone,
  };
}

/**
 * Creates a mock inEuint64 from a plain uint64 value (for testing).
 * In production, this should come from cofhejs.encrypt([Encryptable.uint64(value)]).
 * 
 * Per CONTEXT/cofhe-docs: mock encryption uses trivial encryption for local dev.
 */
export function mockInEuint64(value: bigint | number): InEuint64 {
  const num = typeof value === "bigint" ? value : BigInt(value);
  // Mock format: 32 bytes with value in last 8 bytes (uint64 BE)
  const buf = Buffer.alloc(32);
  buf.writeBigUInt64BE(num, 24);
  return formatInEuint64(buf, 0);
}

