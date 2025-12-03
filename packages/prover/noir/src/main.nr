// ZecRep Tier Range Proof Circuit
//
// This circuit proves that a user's total Zcash activity (in zatoshis)
// falls within a specific tier range without revealing the exact amount.
//
// Inputs:
//   - total_zats: The sum of all shielded notes (Sapling + Orchard) in zatoshis
//   - bronze_max: Maximum value for Bronze tier (2 ZEC = 200,000,000 zatoshis)
//   - silver_max: Maximum value for Silver tier (10 ZEC = 1,000,000,000 zatoshis)
//   - gold_max: Maximum value for Gold tier (50 ZEC = 5,000,000,000 zatoshis)
//
// Output:
//   - tier: 1=Bronze, 2=Silver, 3=Gold, 4=Platinum
//
// Privacy: Only the tier bucket is revealed, not the exact total.

fn main(total_zats: Field, bronze_max: Field, silver_max: Field, gold_max: Field) -> pub Field {
    // Validate inputs are non-negative
    constrain total_zats >= 0;
    constrain bronze_max >= 0;
    constrain silver_max >= 0;
    constrain gold_max >= 0;
    
    // Validate tier thresholds are in ascending order
    constrain bronze_max < silver_max;
    constrain silver_max < gold_max;
    
    // Ensure total doesn't exceed reasonable bounds (sanity check)
    // Max 1000 ZEC = 100,000,000,000 zatoshis
    let max_reasonable = 100_000_000_000;
    constrain total_zats <= max_reasonable;

    // Determine tier based on range comparisons
    // Use explicit constraints to ensure tier assignment is correct
    let tier = if total_zats <= bronze_max {
        1 // BRONZE: 1-2 ZEC
    } else if total_zats <= silver_max {
        2 // SILVER: 3-10 ZEC
    } else if total_zats <= gold_max {
        3 // GOLD: 10-50 ZEC
    } else {
        4 // PLATINUM: 50+ ZEC
    };

    // Ensure tier is valid (1-4)
    constrain tier >= 1;
    constrain tier <= 4;

    // Ensure tier assignment is consistent with thresholds
    // If tier is 1, total must be <= bronze_max
    // If tier is 2, total must be > bronze_max and <= silver_max
    // If tier is 3, total must be > silver_max and <= gold_max
    // If tier is 4, total must be > gold_max
    
    let is_bronze = if tier == 1 { 1 } else { 0 };
    let is_silver = if tier == 2 { 1 } else { 0 };
    let is_gold = if tier == 3 { 1 } else { 0 };
    let is_platinum = if tier == 4 { 1 } else { 0 };

    // Enforce tier constraints
    constrain is_bronze * (total_zats - bronze_max) <= 0;
    constrain is_silver * (total_zats - bronze_max) > 0;
    constrain is_silver * (total_zats - silver_max) <= 0;
    constrain is_gold * (total_zats - silver_max) > 0;
    constrain is_gold * (total_zats - gold_max) <= 0;
    constrain is_platinum * (total_zats - gold_max) > 0;

    // Ensure exactly one tier is selected
    constrain is_bronze + is_silver + is_gold + is_platinum == 1;

    // Public output: tier only (total_zats remains private)
    tier
}

// Helper function to prove a specific tier (for future use)
fn prove_tier(total_zats: Field, tier_max: Field) -> bool {
    total_zats <= tier_max
}
