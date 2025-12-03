#!/usr/bin/env node
import Fastify, { type FastifyRequest, type FastifyReply } from "fastify";
import cors from "@fastify/cors";
import { loadEnv } from "./config.js";
import { runMockPipeline } from "./pipeline/mockRange.js";
import { logger } from "./lib/logger.js";

export async function buildProverServer() {
  const env = loadEnv();
  const server = Fastify({
    logger,
  });

  await server.register(cors, {
    origin: true,
  });

  server.post("/prove", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      address: string;
      viewingKey: string;
    };

    if (!body.address || !body.viewingKey) {
      return reply.status(400).send({
        error: "Missing required fields: address, viewingKey",
      });
    }

    try {
      const artifact = await runMockPipeline(
        {
          address: body.address,
          viewingKey: body.viewingKey,
        },
        env
      );

      return {
        success: true,
        artifact: {
          tier: artifact.tier,
          proofHash: artifact.proofHash,
          encryptedPayload: artifact.encryptedPayload,
          inEuint64: artifact.inEuint64,
          notesScanned: artifact.notesScanned,
        },
      };
    } catch (error) {
      logger.error({ error, body }, "Prover failed");
      return reply.status(500).send({
        error: "Proof generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  server.get("/health", async () => ({
    status: "ok",
    service: "zecrep-prover",
    version: "0.1.0",
  }));

  const start = async () => {
    try {
      const port = Number(process.env.PROVER_PORT || 4101);
      await server.listen({ host: "0.0.0.0", port });
      logger.info({ port }, "Prover service listening");
    } catch (err) {
      server.log.error(err);
      process.exit(1);
    }
  };

  if (process.env.NODE_ENV !== "test") {
    start();
  }

  return server;
}

