/**
 * Contract types and ABIs for ZecRepRegistry and ZecRepBadge.
 * 
 * These will be generated from the Solidity contracts using typechain or similar.
 * For now, we provide TypeScript type definitions matching the contract interfaces.
 */

export type TierLevel = "NONE" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export type TierConfig = {
  name: string;
  minZats: bigint;
  maxZats: bigint;
  score: number;
};

export type ProofRecord = {
  encryptedTotal: string; // euint64 (ciphertext)
  submittedAt: bigint;
  proofHash: string;
  tier: number;
  score: number;
};

export type InEuint64 = {
  data: string;
  securityZone: number;
};

// Contract addresses (will be populated based on network)
export const CONTRACT_ADDRESSES = {
  mainnet: "0x0000000000000000000000000000000000000000",
  sepolia: "0x0000000000000000000000000000000000000000",
  localhost: "0x0000000000000000000000000000000000000000",
} as const;

