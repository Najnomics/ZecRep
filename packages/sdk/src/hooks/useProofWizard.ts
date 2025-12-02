import { useState, useCallback } from "react";
import type { AggregatorClient } from "../client/aggregator.js";

export type ProofWizardStep = "scan" | "prove" | "encrypt" | "submit" | "complete";

export type ProofWizardState = {
  step: ProofWizardStep;
  scanning: boolean;
  proving: boolean;
  encrypting: boolean;
  submitting: boolean;
  error: Error | null;
  scanResult: {
    saplingZats: bigint;
    orchardZats: bigint;
    totalNotes: number;
  } | null;
  proofResult: {
    tier: string;
    proofHash: string;
  } | null;
  encryptedResult: {
    encryptedPayload: string;
    jobId?: string;
  } | null;
};

/**
 * React hook for managing the proof wizard flow.
 * Coordinates scanning, proving, encryption, and submission steps.
 */
export function useProofWizard(client: AggregatorClient) {
  const [state, setState] = useState<ProofWizardState>({
    step: "scan",
    scanning: false,
    proving: false,
    encrypting: false,
    submitting: false,
    error: null,
    scanResult: null,
    proofResult: null,
    encryptedResult: null,
  });

  const scan = useCallback(
    async (viewingKey: string) => {
      setState((prev) => ({ ...prev, scanning: true, error: null, step: "scan" }));

      try {
        // TODO: Call actual scanning API
        // For now, mock the scan result
        const scanResult = {
          saplingZats: BigInt(15_000_000_000), // 15 ZEC
          orchardZats: BigInt(0),
          totalNotes: 5,
        };

        setState((prev) => ({
          ...prev,
          scanning: false,
          scanResult,
          step: "prove",
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          scanning: false,
          error: error instanceof Error ? error : new Error("Scan failed"),
        }));
      }
    },
    []
  );

  const prove = useCallback(async () => {
    if (!state.scanResult) {
      setState((prev) => ({
        ...prev,
        error: new Error("Scan must complete before proving"),
      }));
      return;
    }

    setState((prev) => ({ ...prev, proving: true, error: null }));

    try {
      const total = state.scanResult.saplingZats + state.scanResult.orchardZats;
      
      // Determine tier
      let tier = "BRONZE";
      if (total > BigInt(50_000_000_000)) tier = "PLATINUM";
      else if (total > BigInt(10_000_000_000)) tier = "GOLD";
      else if (total > BigInt(2_000_000_000)) tier = "SILVER";

      // TODO: Generate actual Noir proof
      const proofHash = `0x${Buffer.from(total.toString()).toString("hex").slice(0, 64)}`;

      const proofResult = {
        tier,
        proofHash,
      };

      setState((prev) => ({
        ...prev,
        proving: false,
        proofResult,
        step: "encrypt",
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        proving: false,
        error: error instanceof Error ? error : new Error("Proof generation failed"),
      }));
    }
  }, [state.scanResult]);

  const encrypt = useCallback(async () => {
    if (!state.proofResult) {
      setState((prev) => ({
        ...prev,
        error: new Error("Proof must complete before encryption"),
      }));
      return;
    }

    setState((prev) => ({ ...prev, encrypting: true, error: null }));

    try {
      // TODO: Call FHE encryption API
      const encryptedResult = {
        encryptedPayload: `fhe://encrypted/${state.proofResult.proofHash.slice(2, 10)}`,
      };

      setState((prev) => ({
        ...prev,
        encrypting: false,
        encryptedResult,
        step: "submit",
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        encrypting: false,
        error: error instanceof Error ? error : new Error("Encryption failed"),
      }));
    }
  }, [state.proofResult]);

  const submit = useCallback(
    async (address: string) => {
      if (!state.proofResult || !state.encryptedResult) {
        setState((prev) => ({
          ...prev,
          error: new Error("Proof and encryption must complete before submission"),
        }));
        return;
      }

      setState((prev) => ({ ...prev, submitting: true, error: null }));

      try {
        // TODO: Submit to aggregator job API
        const job = await client.submitRangeJob({
          address,
          tier: state.proofResult.tier,
          proofHash: state.proofResult.proofHash,
          viewingKey: "", // Not sent to server
        });

        setState((prev) => ({
          ...prev,
          submitting: false,
          step: "complete",
          encryptedResult: {
            ...prev.encryptedResult!,
            jobId: job.job.id,
          },
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          submitting: false,
          error: error instanceof Error ? error : new Error("Submission failed"),
        }));
      }
    },
    [state.proofResult, state.encryptedResult, client]
  );

  const reset = useCallback(() => {
    setState({
      step: "scan",
      scanning: false,
      proving: false,
      encrypting: false,
      submitting: false,
      error: null,
      scanResult: null,
      proofResult: null,
      encryptedResult: null,
    });
  }, []);

  return {
    state,
    scan,
    prove,
    encrypt,
    submit,
    reset,
  };
}

