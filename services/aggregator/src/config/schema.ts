import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(4100),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  ZCASH_LIGHTWALLETD_URL: z.string().url(),
  FHE_GATEWAY_URL: z.string().url(),
  REGISTRY_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Expected 0x-prefixed 20 byte address"),
});

export type Env = z.infer<typeof envSchema>;

