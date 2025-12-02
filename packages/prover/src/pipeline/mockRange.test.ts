import { describe, expect, it } from "vitest";
import { runMockPipeline } from "./mockRange.js";

describe("runMockPipeline", () => {
  it("returns deterministic placeholder artifacts", async () => {
    const artifact = await runMockPipeline(
      {
        address: "0x1234567890abcdef1234567890abcdef12345678",
        viewingKey: "uviewingkey",
        tier: "GOLD"
      },
      {
        LIGHTWALLETD_URL: "https://example.com",
        FHE_GATEWAY_URL: "https://api.helium.fhenix.zone",
        AGGREGATOR_URL: "http://localhost:4100",
        REGISTRY_ADDRESS: "0x0000000000000000000000000000000000000000"
      }
    );
    expect(artifact.tier).toBe("GOLD");
    expect(artifact.encryptedPayload).toContain("fhe://");
  });
});

