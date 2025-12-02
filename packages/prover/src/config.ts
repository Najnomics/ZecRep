import { z } from "zod";

const envSchema = z.object({
  LIGHTWALLETD_URL: z.string().url().default("https://lightwalletd.example.net"),
  LIGHTWALLETD_USER: z.string().optional(),
  LIGHTWALLETD_PASSWORD: z.string().optional(),
  FHE_GATEWAY_URL: z.string().url().default("https://api.helium.fhenix.zone"),
  AGGREGATOR_URL: z.string().url().default("http://localhost:4100"),
  REGISTRY_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Expected 0x-prefixed 20 byte address")
    .default("0x0000000000000000000000000000000000000000"),
  ENABLE_GRPC: z
    .union([z.string().transform((val) => val === "true"), z.boolean()])
    .default(false),
});

export type ProverEnv = z.infer<typeof envSchema>;

let cached: ProverEnv | undefined;

export function loadEnv(): ProverEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid prover env: ${parsed.error.message}`);
  }
  cached = parsed.data;
  return cached;
}

