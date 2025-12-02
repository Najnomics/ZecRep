/**
 * CompactBlock parser for extracting shielded notes.
 * 
 * Parses CompactBlock and CompactTx messages from lightwalletd
 * to extract Sapling and Orchard note commitments for scanning.
 */

export interface CompactNote {
  commitment: Uint8Array;
  value: number; // In zatoshis
  poolType: "SAPLING" | "ORCHARD";
  txid: Uint8Array;
  blockHeight: number;
}

export interface ParsedBlock {
  height: number;
  hash: Uint8Array;
  time: number;
  notes: CompactNote[];
}

/**
 * Parse a CompactBlock to extract relevant shielded notes.
 * 
 * TODO: Implement full note commitment extraction with viewing key matching.
 * For now, this extracts all notes; filtering by viewing key should happen
 * after this step using note commitment tree lookups.
 */
export function parseCompactBlock(block: any): ParsedBlock {
  const notes: CompactNote[] = [];
  
  // Extract block metadata
  const height = block.height || 0;
  const hash = block.hash || new Uint8Array();
  const time = block.time || 0;
  
  // Iterate through compact transactions
  const transactions = block.vtx || [];
  
  for (const tx of transactions) {
    const txid = tx.txid || new Uint8Array();
    
    // Extract Sapling outputs
    const saplingOutputs = tx.outputs || [];
    for (const output of saplingOutputs) {
      if (output.cmu) { // cmu = commitment
        notes.push({
          commitment: output.cmu,
          value: output.value || 0,
          poolType: "SAPLING",
          txid,
          blockHeight: height,
        });
      }
    }
    
    // Extract Orchard actions
    const orchardActions = tx.actions || [];
    for (const action of orchardActions) {
      if (action.nullifier) {
        // Orchard notes are identified by nullifiers when spent
        // For unspent notes, we need to check the commitment
        // TODO: Implement full Orchard note parsing
        notes.push({
          commitment: action.nullifier, // Placeholder - should be note commitment
          value: 0, // TODO: Extract from action
          poolType: "ORCHARD",
          txid,
          blockHeight: height,
        });
      }
    }
  }
  
  return {
    height,
    hash,
    time,
    notes,
  };
}

/**
 * Aggregate notes from multiple blocks.
 */
export function aggregateNotes(blocks: ParsedBlock[]): CompactNote[] {
  const allNotes: CompactNote[] = [];
  
  for (const block of blocks) {
    allNotes.push(...block.notes);
  }
  
  return allNotes;
}

/**
 * Filter notes by pool type.
 */
export function filterByPool(notes: CompactNote[], poolType: "SAPLING" | "ORCHARD"): CompactNote[] {
  return notes.filter((note) => note.poolType === poolType);
}

/**
 * Calculate total value from notes.
 */
export function calculateTotal(notes: CompactNote[]): { saplingZats: bigint; orchardZats: bigint } {
  let saplingZats = 0n;
  let orchardZats = 0n;
  
  for (const note of notes) {
    const value = BigInt(note.value);
    if (note.poolType === "SAPLING") {
      saplingZats += value;
    } else {
      orchardZats += value;
    }
  }
  
  return { saplingZats, orchardZats };
}

