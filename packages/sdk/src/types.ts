/**
 * Core types for ZecRep SDK
 */

export type TierLevel = "NONE" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export type TierData = {
  address: string;
  tier: TierLevel;
  score: number;
  encryptedTotal?: string;
  volumeZats?: number;
  updatedAt: string;
};

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export type RangeJob = {
  id: string;
  status: JobStatus;
  address: string;
  tier: TierLevel;
  proofHash: string;
  submittedAt: string;
  updatedAt?: string;
  result?: {
    encryptedPayload: string;
    inEuint64?: {
      data: string;
      securityZone: number;
    };
  };
  error?: string;
};

export type ProofInput = {
  address: string;
  viewingKey: string;
  tier: TierLevel;
};

