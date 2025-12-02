#!/usr/bin/env node
import { Command } from "commander";
import pino from "pino";
import { loadEnv } from "./config.js";
import { runMockPipeline } from "./pipeline/mockRange.js";
import { submitRangeJob, pollRangeJob } from "./lib/aggregatorClient.js";
import { deriveUnifiedViewingKey } from "./zip32/viewingKey.js";

const program = new Command();
const logger = pino({
  level: process.env.LOG_LEVEL ?? "info"
});

program
  .name("zecrep-prover")
  .description("Local proof + encryption pipeline for ZecRep")
  .version("0.1.0");

program
  .command("mock-range")
  .description("Run the placeholder range proof pipeline for a wallet (scaffolding step)")
  .requiredOption("--address <hex>", "Ethereum address that will submit the proof")
  .option("--viewing-key <vk>", "Zcash unified/full viewing key placeholder")
  .option("--seed <seed>", "Hex-encoded ZIP32 seed (fallback if viewing key not provided)")
  .action(async (opts) => {
    const env = loadEnv();
    logger.info({ env }, "Loaded prover env");
    const artifact = await runMockPipeline(
      {
        address: opts.address,
        viewingKey: opts.viewingKey ?? deriveViewingKeyOrThrow(opts.seed)
      },
      env
    );
    logger.info({ artifact }, "Mock pipeline completed");
    try {
      const job = await submitRangeJob(env, artifact);
      logger.info({ job }, "Submitted mock range job to aggregator");
    } catch (err) {
      logger.warn(err, "Failed to submit job to aggregator");
    }
    console.log(JSON.stringify(artifact, null, 2));
  });

program
  .command("jobs:tail")
  .description("Tail mock range-proof jobs from the aggregator")
  .requiredOption("--id <jobId>", "Job id returned from mock-range")
  .action(async (opts) => {
    const env = loadEnv();
    const interval = setInterval(async () => {
      try {
        const job = await pollRangeJob(env, opts.id);
        logger.info({ job }, "Job status");
        if (job.job.status === "completed") {
          clearInterval(interval);
        }
      } catch (err) {
        logger.error(err, "Failed to poll job");
        clearInterval(interval);
      }
    }, 1000);
  });

program.parseAsync().catch((err) => {
  logger.error(err, "Prover CLI crashed");
  process.exit(1);
});

function deriveViewingKeyOrThrow(seed?: string) {
  if (!seed) {
    throw new Error("Provide either --viewing-key or --seed");
  }
  return deriveUnifiedViewingKey(seed);
}

