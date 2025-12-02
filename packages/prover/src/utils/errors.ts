/**
 * Error classes for the prover CLI.
 */

export class ProverError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "ProverError";
  }
}

export class ViewingKeyError extends ProverError {
  constructor(message: string) {
    super(message, "VIEWING_KEY_ERROR");
    this.name = "ViewingKeyError";
  }
}

export class ProofGenerationError extends ProverError {
  constructor(message: string) {
    super(message, "PROOF_GENERATION_ERROR");
    this.name = "ProofGenerationError";
  }
}

export class EncryptionError extends ProverError {
  constructor(message: string) {
    super(message, "ENCRYPTION_ERROR");
    this.name = "EncryptionError";
  }
}

export class AggregatorError extends ProverError {
  constructor(message: string, public readonly statusCode?: number) {
    super(message, "AGGREGATOR_ERROR");
    this.name = "AggregatorError";
  }
}

export function handleError(error: unknown): never {
  if (error instanceof ProverError) {
    console.error(`\n❌ ${error.name}: ${error.message}`);
    process.exit(1);
  }

  if (error instanceof Error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }

  console.error("\n❌ Unknown error occurred");
  process.exit(1);
}

