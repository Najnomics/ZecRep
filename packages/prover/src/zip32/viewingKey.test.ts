import { describe, expect, it } from "vitest";
import { deriveUnifiedViewingKey } from "./viewingKey.js";

describe("deriveUnifiedViewingKey", () => {
  it("produces deterministic viewing keys", () => {
    const seed = "0x0123456789abcdef";
    const vk1 = deriveUnifiedViewingKey(seed);
    const vk2 = deriveUnifiedViewingKey(seed);
    expect(vk1).toBe(vk2);
    expect(vk1.startsWith("uvk_")).toBe(true);
  });
});

