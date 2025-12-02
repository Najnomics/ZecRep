/**
 * Configuration for the proof pipeline stages.
 */

export interface PipelineConfig {
  /** Maximum number of notes to scan per request */
  maxNotesToScan: number;
  /** Block height range to scan (back from current) */
  blockScanRange: number;
  /** Enable Noir proving (if false, uses mock proofs) */
  enableNoirProofs: boolean;
  /** Enable FHE encryption (if false, uses mock encryption) */
  enableFHEEncryption: boolean;
  /** Timeout for proof generation in seconds */
  proofTimeout: number;
  /** Timeout for encryption in seconds */
  encryptionTimeout: number;
}

export const defaultPipelineConfig: PipelineConfig = {
  maxNotesToScan: 1000,
  blockScanRange: 1000, // Scan last 1000 blocks
  enableNoirProofs: process.env.ENABLE_NOIR_PROOFS === "true",
  enableFHEEncryption: process.env.ENABLE_FHE_ENCRYPTION !== "false",
  proofTimeout: 300, // 5 minutes
  encryptionTimeout: 60, // 1 minute
};

export function loadPipelineConfig(): PipelineConfig {
  return {
    ...defaultPipelineConfig,
    maxNotesToScan: Number(process.env.MAX_NOTES_TO_SCAN) || defaultPipelineConfig.maxNotesToScan,
    blockScanRange: Number(process.env.BLOCK_SCAN_RANGE) || defaultPipelineConfig.blockScanRange,
    enableNoirProofs: process.env.ENABLE_NOIR_PROOFS === "true",
    enableFHEEncryption: process.env.ENABLE_FHE_ENCRYPTION !== "false",
    proofTimeout: Number(process.env.PROOF_TIMEOUT) || defaultPipelineConfig.proofTimeout,
    encryptionTimeout: Number(process.env.ENCRYPTION_TIMEOUT) || defaultPipelineConfig.encryptionTimeout,
  };
}

