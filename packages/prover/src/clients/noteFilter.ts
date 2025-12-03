import crypto from "node:crypto";
import type { CompactNote } from "./compactBlockParser.js";

/**
 * Deterministic placeholder filter for associating notes with a viewing key.
 *
 * TODO: Replace with real Sapling/Orchard note decryption using viewing keys:
 * - Use ZIP-32 derived viewing key to decrypt note plaintext
 * - Verify commitment matches viewing key
 * - Track nullifiers to avoid double counting
 */
export function filterNotesByViewingKey(notes: CompactNote[], viewingKey: string): CompactNote[] {
  if (notes.length === 0) {
    return [];
  }

  const keyBuffer = Buffer.from(viewingKey);

  return notes.filter((note) => {
    const hash = crypto.createHash("sha256");
    hash.update(keyBuffer);
    hash.update(note.commitment);
    const digest = hash.digest();

    // Use first byte as deterministic selector
    // ~25% of notes will be attributed to the viewing key
    return digest[0] < 64;
  });
}

