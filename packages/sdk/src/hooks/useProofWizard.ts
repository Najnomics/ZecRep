import { useRef, useState } from "react";
import type { AggregatorClient } from "../client/aggregator.js";
import type { RangeJob, TierLevel } from "../types.js";

export type ProofWizardStep = "idle" | "scan" | "prove" | "encrypt" | "submit" | "complete";

export type ProofWizardState = {
  step: ProofWizardStep;
  submitting: boolean;
  error: Error | null;
  proofResult: {
    tier: TierLevel;
    proofHash: string;
  } | null;
  encryptedResult: {
    encryptedPayload: string;
    inEuint64?: {
      data: string;
      securityZone: number;
    };
    jobId?: string;
  } | null;
  scanResult: {
    totalNotes: number;
    totalZats: bigint;
  } | null;
  job?: RangeJob;
  viewingKey?: string;
  address?: string;
  processingTicks: number;
};

/**
 * Proof wizard hook orchestrating the async scan → prove → encrypt pipeline via the aggregator.
 */
export function useProofWizard(client: AggregatorClient) {
  const initialState: ProofWizardState = {
    step: "idle",
    submitting: false,
    error: null,
    proofResult: null,
    encryptedResult: null,
    scanResult: null,
    job: undefined,
    viewingKey: undefined,
    address: undefined,
    processingTicks: 0,
  };

  const [state, setState] = useState<ProofWizardState>(initialState);
  const activeJobRef = useRef<string | null>(null);

  const setError = (error: Error | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const start = async (viewingKey: string, address: string) => {
    if (!viewingKey) {
      setError(new Error("Viewing key is required"));
      return;
    }
    if (!address) {
      setError(new Error("Ethereum address is required"));
      return;
    }

    activeJobRef.current = null;
    setState({
      ...initialState,
      submitting: true,
      step: "scan",
      viewingKey,
      address,
    });

    try {
      const job = await client.submitRangeJob({
        address,
        viewingKey,
      });

      activeJobRef.current = job.id;

      setState((prev) => ({
        ...prev,
        submitting: false,
        job,
        step: "scan",
      }));

      await pollJob(job.id);
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Failed to start proof job"));
      setState((prev) => ({
        ...prev,
        submitting: false,
      }));
    }
  };

  const pollJob = async (jobId: string) => {
    const maxAttempts = 60;
    const interval = 4000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (activeJobRef.current !== jobId) {
        return;
      }

      let job: RangeJob;
      try {
        job = await client.getJobStatus(jobId);
      } catch (error) {
        setError(error instanceof Error ? error : new Error("Failed to fetch job status"));
        await new Promise((resolve) => setTimeout(resolve, interval));
        continue;
      }

      if (job.status === "pending") {
        setState((prev) => ({
          ...prev,
          job,
          step: prev.step === "idle" ? "scan" : prev.step,
        }));
      } else if (job.status === "processing") {
        setState((prev) => {
          const nextTicks = prev.processingTicks + 1;
          let nextStep = prev.step;
          if (prev.step === "scan") {
            nextStep = "prove";
          } else if (prev.step === "prove" && nextTicks >= 2) {
            nextStep = "encrypt";
          }
          return {
            ...prev,
            job,
            processingTicks: nextTicks,
            step: nextStep,
          };
        });
      } else if (job.status === "completed") {
        setState((prev) => ({
          ...prev,
          job,
          step: "submit",
          proofResult: {
            tier: job.tier,
            proofHash: job.proofHash,
          },
          encryptedResult: job.result
            ? {
                encryptedPayload: job.result.encryptedPayload,
                inEuint64: job.result.inEuint64,
                jobId: job.id,
              }
            : prev.encryptedResult,
          scanResult: job.result
            ? {
                totalNotes: job.result.notesScanned ?? 0,
                totalZats: job.result.totalZats ? BigInt(job.result.totalZats) : 0n,
              }
            : prev.scanResult,
        }));

        setTimeout(() => {
          if (activeJobRef.current === jobId) {
            setState((prev) => ({
              ...prev,
              step: "complete",
            }));
            activeJobRef.current = null;
          }
        }, 1200);
        return;
      } else if (job.status === "failed") {
        setError(new Error(job.error ?? "Job failed"));
        activeJobRef.current = null;
        setState((prev) => ({
          ...prev,
          job,
        }));
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    setError(new Error("Job polling timed out"));
    activeJobRef.current = null;
  };

  const reset = () => {
    activeJobRef.current = null;
    setState(initialState);
  };

  return {
    state,
    start,
    reset,
  };
}

