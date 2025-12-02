/**
 * IPFS client for storing badge metadata and artwork.
 * 
 * Supports multiple IPFS pinning services:
 * - Pinata
 * - Infura IPFS
 * - Local IPFS node
 * - Web3.Storage
 */

import { fetch } from "undici";
import { logger } from "./logger.js";

export type IPFSConfig = {
  provider: "pinata" | "infura" | "local" | "web3storage";
  apiKey?: string;
  apiSecret?: string;
  endpoint?: string;
};

export type IPFSMetadata = {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
};

/**
 * Upload metadata to IPFS and return CID.
 */
export async function uploadToIPFS(
  metadata: IPFSMetadata,
  config: IPFSConfig
): Promise<string> {
  const metadataJson = JSON.stringify(metadata, null, 2);

  switch (config.provider) {
    case "pinata":
      return uploadToPinata(metadataJson, config);
    case "infura":
      return uploadToInfura(metadataJson, config);
    case "web3storage":
      return uploadToWeb3Storage(metadataJson, config);
    case "local":
      return uploadToLocal(metadataJson, config);
    default:
      throw new Error(`Unsupported IPFS provider: ${config.provider}`);
  }
}

/**
 * Upload to Pinata IPFS service.
 */
async function uploadToPinata(content: string, config: IPFSConfig): Promise<string> {
  if (!config.apiKey || !config.apiSecret) {
    throw new Error("Pinata requires API key and secret");
  }

  const formData = new FormData();
  const blob = new Blob([content], { type: "application/json" });
  formData.append("file", blob, "metadata.json");

  const pinataMetadata = JSON.stringify({
    name: "ZecRep Badge Metadata",
  });

  formData.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 1,
  });

  formData.append("pinataOptions", pinataOptions);

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: config.apiKey,
      pinata_secret_api_key: config.apiSecret,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Pinata upload failed: ${response.status} ${text}`);
  }

  const result = (await response.json()) as { IpfsHash: string };
  logger.info({ cid: result.IpfsHash }, "Uploaded to Pinata IPFS");
  return result.IpfsHash;
}

/**
 * Upload to Infura IPFS service.
 */
async function uploadToInfura(content: string, config: IPFSConfig): Promise<string> {
  if (!config.apiKey || !config.apiSecret) {
    throw new Error("Infura requires API key and secret");
  }

  const auth = Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64");
  const endpoint = config.endpoint || "https://ipfs.infura.io:5001";

  const formData = new FormData();
  const blob = new Blob([content], { type: "application/json" });
  formData.append("file", blob, "metadata.json");

  const response = await fetch(`${endpoint}/api/v0/add`, {
    method: "POST",
    headers: {
      authorization: `Basic ${auth}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Infura IPFS upload failed: ${response.status} ${text}`);
  }

  const result = (await response.json()) as { Hash: string };
  logger.info({ cid: result.Hash }, "Uploaded to Infura IPFS");
  return result.Hash;
}

/**
 * Upload to Web3.Storage service.
 */
async function uploadToWeb3Storage(content: string, config: IPFSConfig): Promise<string> {
  if (!config.apiKey) {
    throw new Error("Web3.Storage requires API token");
  }

  const blob = new Blob([content], { type: "application/json" });
  const formData = new FormData();
  formData.append("file", blob, "metadata.json");

  const response = await fetch("https://api.web3.storage/upload", {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Web3.Storage upload failed: ${response.status} ${text}`);
  }

  const result = (await response.json()) as { cid: string };
  logger.info({ cid: result.cid }, "Uploaded to Web3.Storage");
  return result.cid;
}

/**
 * Upload to local IPFS node.
 */
async function uploadToLocal(content: string, config: IPFSConfig): Promise<string> {
  const endpoint = config.endpoint || "http://localhost:5001";

  const formData = new FormData();
  const blob = new Blob([content], { type: "application/json" });
  formData.append("file", blob, "metadata.json");

  const response = await fetch(`${endpoint}/api/v0/add`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Local IPFS upload failed: ${response.status} ${text}`);
  }

  const result = (await response.json()) as { Hash: string };
  logger.info({ cid: result.Hash }, "Uploaded to local IPFS");
  return result.Hash;
}

/**
 * Generate badge metadata JSON for a tier.
 */
export function generateBadgeMetadata(
  tier: string,
  score: number,
  imageCid?: string
): IPFSMetadata {
  const tierConfig: Record<
    string,
    { name: string; emoji: string; color: string; description: string }
  > = {
    BRONZE: {
      name: "Bronze ZecRep Badge",
      emoji: "🥉",
      color: "orange",
      description: "ZecRep Bronze tier badge - 1-2 ZEC activity",
    },
    SILVER: {
      name: "Silver ZecRep Badge",
      emoji: "🥈",
      color: "gray",
      description: "ZecRep Silver tier badge - 3-10 ZEC activity",
    },
    GOLD: {
      name: "Gold ZecRep Badge",
      emoji: "🥇",
      color: "yellow",
      description: "ZecRep Gold tier badge - 10-50 ZEC activity",
    },
    PLATINUM: {
      name: "Platinum ZecRep Badge",
      emoji: "💎",
      color: "cyan",
      description: "ZecRep Platinum tier badge - 50+ ZEC activity",
    },
  };

  const config = tierConfig[tier] || tierConfig.BRONZE;
  const imageUrl = imageCid ? `ipfs://${imageCid}` : `https://zecrep.xyz/badges/${tier.toLowerCase()}.svg`;

  return {
    name: config.name,
    description: config.description,
    image: imageUrl,
    external_url: "https://zecrep.xyz",
    attributes: [
      {
        trait_type: "Tier",
        value: tier,
      },
      {
        trait_type: "Score",
        value: score,
      },
      {
        trait_type: "Reputation",
        value: config.name,
      },
    ],
  };
}

/**
 * Get IPFS gateway URL for a CID.
 */
export function getIPFSUrl(cid: string, gateway = "https://ipfs.io/ipfs/"): string {
  return `${gateway}${cid}`;
}

