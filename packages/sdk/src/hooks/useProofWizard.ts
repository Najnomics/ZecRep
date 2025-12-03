import { useState } from "react";
import type { AggregatorClient } from "../client/aggregator.js";
import type { RangeJob, TierLevel } from "../types.js";

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
    tier: TierLevel;
    proofHash: string;
  } | null;
  encryptedResult: {
    encryptedPayload: string;
    jobId?: string;
  } | null;
  job?: RangeJob;
  viewingKey?: string;
};

/**
 * Proof wizard hook that orchestrates scan → prove → encrypt → submit steps.
 * Currently uses placeholder scanning/encryption logic but integrates with
 * the aggregator for job submission + polling.
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
    job: undefined,
    viewingKey: undefined,
  });

  const setError = (error: Error | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const scan = async (viewingKey: string) => {
    setState((prev) => ({
      ...prev,
      scanning: true,
      error: null,
      step: "scan",
      viewingKey,
    }));

    try {
      // TODO: Hook into actual lightwalletd scanning via prover pipeline
      const scanResult = {
        saplingZats: BigInt(14_000_000_000),
        orchardZats: BigInt(1_000_000_000),
        totalNotes: 7,
      };

      setState((prev) => ({
        ...prev,
        scanning: false,
        scanResult,
        step: "prove",
      }));
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Failed to scan activity"));
      setState((prev) => ({ ...prev, scanning: false }));
    }
  };

  const prove = async () => {
    if (!state.scanResult) {
      setError(new Error("Scan must complete before proving"));
      return;
    }

    setState((prev) => ({ ...prev, proving: true, error: null }));

    try {
      const total = state.scanResult.saplingZats + state.scanResult.orchardZats;
      let tier: TierLevel = "BRONZE";
      if (total > BigInt(50_000_000_000)) tier = "PLATINUM";
      else if (total > BigInt(10_000_000_000)) tier = "GOLD";
      else if (total > BigInt(2_000_000_000)) tier = "SILVER";

      const proofHash = `0x${Buffer.from(total.toString()).toString("hex").slice(0, 64).padEnd(64, "0")}`;

      setState((prev) => ({
        ...prev,
        proving: false,
        proofResult: { tier, proofHash },
        step: "encrypt",
      }));
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Failed to generate proof"));
      setState((prev) => ({ ...prev, proving: false }));
    }
  };

  const encrypt = async () => {
    if (!state.proofResult) {
      setError(new Error("Proof must complete before encryption"));
      return;
    }

    setState((prev) => ({ ...prev, encrypting: true, error: null }));

    try {
      // TODO: call real Cofhe encryption pipeline
      setState((prev) => ({
        ...prev,
        encrypting: false,
        encryptedResult: {
          encryptedPayload: `fhe://placeholder/${prev.proofResult?.proofHash.slice(2, 10)}`,
        },
        step: "submit",
      }));
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Failed to encrypt result"));
      setState((prev) => ({ ...prev, encrypting: false }));
    }
  };

  const submit = async (address: string) => {
    if (!state.proofResult || !state.viewingKey) {
      setError(new Error("Proof and viewing key required before submission"));
      return;
    }

    setState((prev) => ({ ...prev, submitting: true, error: null }));

    try {
      const job = await client.submitRangeJob({
        address,
        viewingKey: state.viewingKey,
        tier: state.proofResult.tier,
      });

      setState((prev) => ({
        ...prev,
        submitting: false,
        job,
        encryptedResult: {
          ...(prev.encryptedResult ?? { encryptedPayload: "" }),
          jobId: job.id,
        },
        step: "submit",
      }));

      await pollJob(job.id);
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Failed to submit job"));
      setState((prev) => ({ ...prev, submitting: false }));
    }
  };

  const pollJob = async (jobId: string) => {
    const maxAttempts = 20;
    const interval = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const job = await client.getJobStatus(jobId);
      setState((prev) => ({ ...prev, job }));

      if (job.status === "completed") {
        setState((prev) => ({ ...prev, step: "complete" }));
        return;
      }

      if (job.status === "failed") {
        setError(new Error(job.error ?? "Job failed"));
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    setError(new Error("Job polling timed out"));
  };

  const reset = () => {
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
      job: undefined,
      viewingKey: undefined,
    });
  };

  return {
    state,
    scan,
    prove,
    encrypt,
    submit,
    reset,
  };
}

