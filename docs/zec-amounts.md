# How ZEC Amounts Are Tracked in ZecRep

## Overview

**ZecRep does NOT wrap or bridge ZEC tokens.** Instead, it's a reputation oracle that tracks Zcash activity amounts and stores them as **FHE-encrypted values** on Ethereum.

## Key Concepts

### 1. Zatoshis (Units of ZEC)

ZEC amounts are tracked in **zatoshis** - the smallest unit of ZEC (like satoshis for Bitcoin):

```solidity
uint64 public constant ZATOSHI = 1e8; // 100,000,000 zatoshis = 1 ZEC
```

Tier thresholds are defined in zatoshis:

```typescript
export const TIER_THRESHOLDS = {
  bronzeMax: 2n * ZATOSHI,    // 2 ZEC = 200,000,000 zatoshis
  silverMax: 10n * ZATOSHI,   // 10 ZEC = 1,000,000,000 zatoshis
  goldMax: 50n * ZATOSHI,     // 50 ZEC = 5,000,000,000 zatoshis
};
```

### 2. FHE-Encrypted Storage

Amounts are stored as **FHE-encrypted values** on-chain, never as plain numbers:

```solidity
struct ProofRecord {
    euint64 encryptedTotal;  // FHE-encrypted total in zatoshis
    uint64 submittedAt;
    bytes32 proofHash;
    uint8 tier;
    uint16 score;
}
```

### 3. The Only "Wrapping" is FHE Encryption

When you see `.wrap()` in the code, it's **FHE encryption wrapping**, not token wrapping:

```solidity
// Line 125 in ZecRepRegistry.sol
record.encryptedTotal = euint64.wrap(uint256(bytes32(encryptedTotal)));
```

This wraps a plaintext value into an FHE-encrypted type (`euint64`), allowing encrypted computations without decryption.

## Data Flow

1. **Scan** → User's Zcash shielded notes are scanned locally (via lightwalletd)
   - Amounts aggregated in zatoshis
   - Never leaves user's device as plaintext

2. **Prove** → Zero-knowledge range proof generated (Noir circuit)
   - Proves amount falls within tier range (e.g., "10-50 ZEC")
   - Does NOT reveal exact amount

3. **Encrypt** → Total is FHE-encrypted using Cofhe/Fhenix
   - Creates `inEuint64` ciphertext
   - Can be compared on-chain without decryption

4. **Store** → Encrypted total stored on Ethereum
   - Stored as `euint64` in `ProofRecord`
   - Badge NFT minted with tier/score metadata

## What's NOT Implemented

- ❌ **No wrapped ZEC token (WZEC)**
- ❌ **No token bridging**
- ❌ **No actual ZEC tokens on Ethereum**
- ❌ **No liquidity pools**

## What IS Implemented

- ✅ **Reputation scores** based on Zcash activity
- ✅ **FHE-encrypted amount storage** (for privacy-preserving comparisons)
- ✅ **Soulbound NFT badges** representing tiers
- ✅ **Tier-based DeFi benefits** (fee discounts, LTV boosts, etc.)

## Example: How Amounts Work

```solidity
// User has 15 ZEC in Zcash (never leaves Zcash chain)
// Amount: 1,500,000,000 zatoshis

// 1. Scanned locally → aggregated total
uint64 totalZats = 1_500_000_000;

// 2. Range proof generated → proves "10-50 ZEC" range
uint8 tier = 3; // GOLD tier

// 3. FHE-encrypted → wrapped as euint64
euint64 encryptedTotal = FHE.asEuint64(encryptedData);

// 4. Stored on-chain → only ciphertext, never decrypted
_record.encryptedTotal = encryptedTotal;
```

## Privacy Guarantees

- **ZEC stays on Zcash**: No tokens are bridged
- **Only ranges revealed**: Tier buckets, not exact amounts
- **FHE protects values**: Encrypted totals allow comparisons without decryption
- **Local computation**: Scanning happens on user's device

## Summary

ZecRep is a **reputation oracle**, not a token bridge. It:
- Tracks Zcash activity in **zatoshis**
- Stores amounts as **FHE-encrypted values**
- Mints **soulbound reputation badges**
- Enables **tier-based DeFi benefits**

The actual ZEC never leaves the Zcash chain - only proof of activity and encrypted totals are used on Ethereum.

