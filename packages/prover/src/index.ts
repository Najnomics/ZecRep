#!/usr/bin/env node
import { Command } from "commander";
import pino from "pino";
import { loadEnv } from "./config.js";
import { runMockPipeline } from "./pipeline/mockRange.js";
import { submitRangeJob } from "./lib/aggregatorClient.js";

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
  .requiredOption("--viewing-key <vk>", "Zcash unified/full viewing key placeholder")
  .option("--tier <tier>", "Target tier (BRONZE/SILVER/GOLD/PLATINUM)", "GOLD")
  .action(async (opts) => {
    const env = loadEnv();
    logger.info({ env }, "Loaded prover env");
    const artifact = await runMockPipeline(
      {
        address: opts.address,
        viewingKey: opts.viewingKey,
        tier: opts.tier.toUpperCase()
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

program.parseAsync().catch((err) => {
  logger.error(err, "Prover CLI crashed");
  process.exit(1);
});

