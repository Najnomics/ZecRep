/**
 * Error classes for ZecRep SDK.
 */

export class ZecRepError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "ZecRepError";
  }
}

export class NetworkError extends ZecRepError {
  constructor(message: string, public readonly statusCode?: number) {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

export class ContractError extends ZecRepError {
  constructor(message: string, public readonly revertReason?: string) {
    super(message, "CONTRACT_ERROR");
    this.name = "ContractError";
  }
}

export class ValidationError extends ZecRepError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class ProofError extends ZecRepError {
  constructor(message: string) {
    super(message, "PROOF_ERROR");
    this.name = "ProofError";
  }
}

export class EncryptionError extends ZecRepError {
  constructor(message: string) {
    super(message, "ENCRYPTION_ERROR");
    this.name = "EncryptionError";
  }
}

export function isZecRepError(error: unknown): error is ZecRepError {
  return error instanceof ZecRepError;
}

export function handleError(error: unknown): ZecRepError {
  if (isZecRepError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new ZecRepError(error.message, "UNKNOWN_ERROR");
  }

  return new ZecRepError("An unknown error occurred", "UNKNOWN_ERROR");
}

