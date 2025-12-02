# ZecRep API Reference

API documentation for the ZecRep aggregator service and TypeScript SDK.

## Aggregator Service

Base URL: `https://aggregator.zecrep.xyz`

### Health & Status

#### `GET /health`

Returns service health and configuration.

**Response:**
```json
{
  "status": "ok",
  "env": {
    "port": 4100,
    "logLevel": "info"
  },
  "timestamp": "2024-12-01T15:04:05.000Z"
}
```

#### `GET /metrics`

Prometheus-compatible metrics endpoint for monitoring.

### Tier Queries

#### `GET /api/reputation/tier?address=0x...`

Get tier information for an Ethereum address.

**Query Parameters:**
- `address` (required): Ethereum address (0x-prefixed hex)

**Response:**
```json
{
  "data": {
    "address": "0x...",
    "tier": "GOLD",
    "score": 500,
    "encryptedTotal": "0x...",
    "volumeZats": 41000000,
    "updatedAt": "2024-12-01T15:04:05.000Z"
  }
}
```

### Guard Endpoints

#### `GET /api/reputation/guards/meets-tier?address=0x...&minimumTier=GOLD`

Check if an address meets a minimum tier requirement.

**Query Parameters:**
- `address` (required): Ethereum address
- `minimumTier` (required): BRONZE, SILVER, GOLD, or PLATINUM

**Response:**
```json
{
  "address": "0x...",
  "userTier": "GOLD",
  "minimumTier": "GOLD",
  "meets": true,
  "canAccess": true
}
```

#### `GET /api/reputation/guards/enforce-tier?address=0x...&minimumTier=GOLD`

Enforce tier requirement - returns 403 if tier not met.

#### `GET /api/reputation/guards/multipliers?address=0x...`

Get tier-based multipliers for fee discounts, LTV boosts, etc.

**Response:**
```json
{
  "address": "0x...",
  "tier": "GOLD",
  "multipliers": {
    "feeDiscount": 0.8,
    "ltvBoostBps": 1000,
    "voteWeight": 2.0,
    "yield": 1.5
  }
}
```

### Job Management

#### `POST /api/jobs/range`

Submit a range proof job for processing.

**Request Body:**
```json
{
  "address": "0x...",
  "tier": "GOLD",
  "proofHash": "0x..."
}
```

**Response (202 Accepted):**
```json
{
  "job": {
    "id": "uuid...",
    "status": "pending",
    "address": "0x...",
    "tier": "GOLD",
    "proofHash": "0x...",
    "submittedAt": "2024-12-01T15:04:05.000Z"
  }
}
```

#### `GET /api/jobs/range/:id`

Poll job status by ID.

**Response:**
```json
{
  "job": {
    "id": "uuid...",
    "status": "completed",
    "result": {
      "encryptedPayload": "fhe://...",
      "inEuint64": {
        "data": "0x...",
        "securityZone": 0
      }
    },
    "updatedAt": "2024-12-01T15:04:30.000Z"
  }
}
```

## TypeScript SDK

See [SDK README](../packages/sdk/README.md) for usage examples.

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "ErrorCode",
  "message": "Human-readable error message",
  "details": {}
}
```

Common error codes:
- `InvalidQuery`: Invalid request parameters
- `NotFound`: Resource not found (e.g., job ID)
- `NotRegistered`: Address has no ZecRep badge
- `TierRequirementNotMet`: Tier requirement not satisfied

## Rate Limits

(To be defined based on production requirements)

## Authentication

(To be defined for protected endpoints)

