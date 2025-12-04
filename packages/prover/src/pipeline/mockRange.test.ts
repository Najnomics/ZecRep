import { describe, expect, it } from "vitest";
import { runMockPipeline } from "./mockRange.js";

describe("runMockPipeline", () => {
  it("returns deterministic placeholder artifacts", async () => {
    const artifact = await runMockPipeline(
      {
        address: "0x1234567890abcdef1234567890abcdef12345678",
        viewingKey: "uviewingkey"
      },
      {
        LIGHTWALLETD_URL: "https://example.com",
        FHE_GATEWAY_URL: "https://api.helium.fhenix.zone",
        AGGREGATOR_URL: "http://localhost:4100",
        REGISTRY_ADDRESS: "0x0000000000000000000000000000000000000000",
        ENABLE_GRPC: false,
      }
    );
    expect(["BRONZE", "SILVER", "GOLD", "PLATINUM"]).toContain(artifact.tier);
    expect(artifact.encryptedPayload).toContain("fhe://");
    expect(artifact.notesScanned).toBeGreaterThanOrEqual(0);
    expect(BigInt(artifact.totalZats)).toBeGreaterThanOrEqual(0n);
    expect(artifact.witness.total_zats).toBeDefined();
  });
});

