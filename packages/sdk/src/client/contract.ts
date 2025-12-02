/**
 * Contract client for interacting with ZecRep smart contracts.
 * Provides typed methods for reading and writing to the registry and badge contracts.
 */

import type { Abi, Address, PublicClient, WalletClient } from "viem";

// TODO: Import actual contract ABIs once generated
// import { ZecRepRegistryAbi } from "@zecrep/contracts/abis/ZecRepRegistry.json";
// import { ZecRepBadgeAbi } from "@zecrep/contracts/abis/ZecRepBadge.json";

export type TierLevel = "NONE" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export type TierData = {
  tier: TierLevel;
  score: number;
  submittedAt: number;
};

export type BadgeData = {
  tokenId: string;
  tier: TierLevel;
  score: number;
  tokenURI: string;
};

/**
 * Client for interacting with ZecRepRegistry contract.
 */
export class RegistryClient {
  constructor(
    private registryAddress: Address,
    private publicClient: PublicClient,
    private walletClient?: WalletClient
  ) {}

  /**
   * Get user's tier information.
   */
  async getUserTier(address: Address): Promise<TierData> {
    // TODO: Replace with actual contract call
    // const [tier, score, submittedAt] = await this.publicClient.readContract({
    //   address: this.registryAddress,
    //   abi: ZecRepRegistryAbi,
    //   functionName: "userTier",
    //   args: [address],
    // });

    // Mock implementation
    return {
      tier: "GOLD",
      score: 500,
      submittedAt: Date.now() / 1000,
    };
  }

  /**
   * Check if user meets minimum tier requirement.
   */
  async meetsTier(address: Address, minimumTier: number): Promise<boolean> {
    // TODO: Replace with actual contract call
    // return await this.publicClient.readContract({
    //   address: this.registryAddress,
    //   abi: ZecRepRegistryAbi,
    //   functionName: "meetsTier",
    //   args: [address, minimumTier],
    // });

    return true; // Mock
  }

  /**
   * Submit a proof to the registry.
   */
  async submitProof(
    encryptedTotal: { data: string; securityZone: number },
    proofHash: string,
    tier: number
  ): Promise<`0x${string}`> {
    if (!this.walletClient) {
      throw new Error("Wallet client required for write operations");
    }

    // TODO: Replace with actual contract call
    // const hash = await this.walletClient.writeContract({
    //   address: this.registryAddress,
    //   abi: ZecRepRegistryAbi,
    //   functionName: "submitProof",
    //   args: [encryptedTotal, proofHash, tier],
    // });

    // Mock transaction hash
    return `0x${Math.random().toString(16).slice(2, 66)}` as `0x${string}`;
  }

  /**
   * Get tier configuration.
   */
  async getTierConfig(tier: number): Promise<{
    name: string;
    minZats: bigint;
    maxZats: bigint;
    score: number;
  }> {
    // TODO: Replace with actual contract call
    // return await this.publicClient.readContract({
    //   address: this.registryAddress,
    //   abi: ZecRepRegistryAbi,
    //   functionName: "getTier",
    //   args: [tier],
    // });

    // Mock implementation
    return {
      name: "Gold",
      minZats: BigInt(10_000_000_000),
      maxZats: BigInt(50_000_000_000),
      score: 500,
    };
  }
}

/**
 * Client for interacting with ZecRepBadge NFT contract.
 */
export class BadgeClient {
  constructor(
    private badgeAddress: Address,
    private publicClient: PublicClient
  ) {}

  /**
   * Check if address has a badge.
   */
  async hasBadge(address: Address): Promise<boolean> {
    // TODO: Replace with actual contract call
    // return await this.publicClient.readContract({
    //   address: this.badgeAddress,
    //   abi: ZecRepBadgeAbi,
    //   functionName: "hasBadge",
    //   args: [address],
    // });

    return false; // Mock
  }

  /**
   * Get badge data for an address.
   */
  async getBadge(address: Address): Promise<BadgeData | null> {
    // TODO: Replace with actual contract call
    // const badge = await this.publicClient.readContract({
    //   address: this.badgeAddress,
    //   abi: ZecRepBadgeAbi,
    //   functionName: "badgeOf",
    //   args: [address],
    // });

    // if (!badge.exists) return null;

    // return {
    //   tokenId: badge.tokenId.toString(),
    //   tier: badge.tier,
    //   score: badge.score,
    //   tokenURI: badge.tokenURI,
    // };

    return null; // Mock
  }

  /**
   * Get badge metadata URI.
   */
  async getTokenURI(tokenId: bigint): Promise<string> {
    // TODO: Replace with actual contract call
    // return await this.publicClient.readContract({
    //   address: this.badgeAddress,
    //   abi: ZecRepBadgeAbi,
    //   functionName: "tokenURI",
    //   args: [tokenId],
    // });

    return "ipfs://mock"; // Mock
  }
}

