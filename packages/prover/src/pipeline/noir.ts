import { mkdtempSync, writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import type { NoirWitness } from "./witness.js";

const NOIR_PROJECT_DIR = resolve(new URL("../../noir", import.meta.url).pathname);

export type NoirResult = {
  proofPath: string;
  proofHash: string;
};

export async function tryProveWithNoir(witness: NoirWitness): Promise<NoirResult | undefined> {
  if (process.env.NOIR_PROVE !== "true") {
    return undefined;
  }
  const tmpDir = mkdtempSync(join(tmpdir(), "zecrep-noir-"));
  const witnessPath = join(tmpDir, "witness.json");
  const proofPath = join(tmpDir, "proof.json");
  writeFileSync(witnessPath, JSON.stringify({ witness }));

  const result = spawnSync("nargo", ["prove", "--witness", witnessPath, "--proof", proofPath], {
    cwd: NOIR_PROJECT_DIR,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error("Noir prove failed");
  }

  const proofData = readFileSync(proofPath);
  const proofHash = `0x${Buffer.from(proofData).toString("hex").slice(0, 64)}`;
  return { proofPath, proofHash };
}

