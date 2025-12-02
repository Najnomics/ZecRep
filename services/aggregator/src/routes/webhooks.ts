import type { FastifyInstance } from "fastify";
import { logger } from "../lib/logger.js";

/**
 * Webhook routes for partner protocol notifications.
 * 
 * Allows protocols to subscribe to tier updates and receive
 * real-time notifications when user tiers change.
 */

export type WebhookSubscription = {
  id: string;
  protocolAddress: string;
  webhookUrl: string;
  events: string[]; // e.g., ["tier_upgrade", "tier_downgrade", "badge_minted"]
  secret?: string; // For webhook signature verification
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
};

// In-memory storage for webhooks (TODO: move to database)
const subscriptions = new Map<string, WebhookSubscription>();

/**
 * Register webhook subscription routes.
 */
export async function registerWebhookRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/webhooks/subscribe
   * Subscribe to tier change events
   */
  fastify.post("/api/webhooks/subscribe", async (request, reply) => {
    try {
      const body = request.body as {
        protocolAddress: string;
        webhookUrl: string;
        events?: string[];
        secret?: string;
      };

      if (!body.protocolAddress || !body.webhookUrl) {
        return reply.status(400).send({
          error: "InvalidRequest",
          message: "protocolAddress and webhookUrl are required",
        });
      }

      const subscriptionId = `wh_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      const subscription: WebhookSubscription = {
        id: subscriptionId,
        protocolAddress: body.protocolAddress,
        webhookUrl: body.webhookUrl,
        events: body.events ?? ["tier_upgrade", "badge_minted"],
        secret: body.secret,
        active: true,
        createdAt: new Date().toISOString(),
      };

      subscriptions.set(subscriptionId, subscription);

      logger.info({ subscriptionId, protocolAddress: body.protocolAddress }, "Webhook subscription created");

      return reply.status(201).send({ subscription });
    } catch (error) {
      fastify.log.error(error, "Failed to create webhook subscription");
      return reply.status(500).send({
        error: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/webhooks/subscriptions
   * List all webhook subscriptions (filtered by protocol address if provided)
   */
  fastify.get("/api/webhooks/subscriptions", async (request, reply) => {
    try {
      const query = request.query as { protocolAddress?: string };

      let subs = Array.from(subscriptions.values());

      if (query.protocolAddress) {
        subs = subs.filter(
          (s) => s.protocolAddress.toLowerCase() === query.protocolAddress!.toLowerCase()
        );
      }

      return { subscriptions: subs };
    } catch (error) {
      fastify.log.error(error, "Failed to list webhook subscriptions");
      return reply.status(500).send({
        error: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * DELETE /api/webhooks/subscriptions/:id
   * Unsubscribe from webhook notifications
   */
  fastify.delete("/api/webhooks/subscriptions/:id", async (request, reply) => {
    try {
      const params = request.params as { id: string };
      const subscriptionId = params.id;

      const subscription = subscriptions.get(subscriptionId);
      if (!subscription) {
        return reply.status(404).send({
          error: "NotFound",
          message: `Webhook subscription ${subscriptionId} not found`,
        });
      }

      subscriptions.delete(subscriptionId);

      logger.info({ subscriptionId }, "Webhook subscription deleted");

      return reply.status(200).send({ message: "Subscription deleted" });
    } catch (error) {
      fastify.log.error(error, "Failed to delete webhook subscription");
      return reply.status(500).send({
        error: "InternalError",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}

/**
 * Trigger webhooks for a tier change event.
 * Called internally when tier updates occur.
 */
export async function triggerWebhooks(
  event: "tier_upgrade" | "tier_downgrade" | "badge_minted",
  data: {
    address: string;
    oldTier?: string;
    newTier: string;
    score: number;
    proofHash: string;
  }
): Promise<void> {
  const relevantSubs = Array.from(subscriptions.values()).filter(
    (sub) => sub.active && sub.events.includes(event)
  );

  if (relevantSubs.length === 0) {
    return;
  }

  logger.info({ event, subscriptionCount: relevantSubs.length }, "Triggering webhooks");

  // Trigger webhooks in parallel (non-blocking)
  const promises = relevantSubs.map(async (sub) => {
    try {
      const payload = {
        event,
        timestamp: new Date().toISOString(),
        data,
      };

      // TODO: Add webhook signature using secret
      const response = await fetch(sub.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-ZecRep-Event": event,
          "X-ZecRep-Subscription-Id": sub.id,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        logger.warn(
          { subscriptionId: sub.id, status: response.status },
          "Webhook delivery failed"
        );
      } else {
        logger.debug({ subscriptionId: sub.id }, "Webhook delivered successfully");
        // Update last triggered timestamp
        sub.lastTriggered = new Date().toISOString();
      }
    } catch (error) {
      logger.error({ error, subscriptionId: sub.id }, "Error triggering webhook");
    }
  });

  await Promise.allSettled(promises);
}

