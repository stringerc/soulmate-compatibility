# Soulmates API Documentation

**Version**: 1.0  
**Base URL**: `https://soulmates.syncscript.app/api/v1/soulmates`  
**Last Updated**: January 2025

---

## Table of Contents

1. [Authentication](#authentication)
2. [Profile API](#profile-api)
3. [Compatibility API](#compatibility-api)
4. [Bonds API](#bonds-api)
5. [Journaling API](#journaling-api)
6. [Billing API](#billing-api)
7. [Analytics API](#analytics-api)
8. [Email API](#email-api)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)

---

## Authentication

### Magic Link Authentication

#### Send Magic Link
```http
POST /api/v1/soulmates/auth/magic-link
Content-Type: application/json

{
  "email": "user@example.com",
  "callback_url": "/me" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Magic link sent to your email",
  "email_sent": true
}
```

#### Verify Magic Link Token
```http
GET /api/v1/soulmates/auth/verify?token={jwt_token}
```

**Response:**
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

### Authentication Headers

For authenticated requests, include the JWT token:

```http
Authorization: Bearer {jwt_token}
```

Or use the `auth_token` from localStorage (handled automatically by the frontend).

---

## Profile API

### Get User Profile
```http
GET /api/v1/soulmates/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "profile": {
    "id": "user_id",
    "traits": [0.5, 0.6, ...], // 32-dimensional vector
    "primary_archetype": "The Guardian",
    "attachment_style": "Secure",
    "love_languages": ["Acts of Service", "Quality Time"],
    "calculated_at": 1234567890
  }
}
```

### Update User Profile
```http
POST /api/v1/soulmates/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "traits": [0.5, 0.6, ...], // 32-dimensional vector
  "primary_archetype": "The Guardian",
  "attachment_style": "Secure",
  "love_languages": ["Acts of Service", "Quality Time"],
  "astrology_meta": {
    "birthdate": "1990-01-01"
  },
  "numerology_meta": {
    "birthdate": "1990-01-01"
  }
}
```

**Response:**
```json
{
  "profile": {
    "id": "user_id",
    "primary_archetype": "The Guardian",
    ...
  }
}
```

---

## Compatibility API

### Explore Compatibility
```http
POST /api/v1/soulmates/compatibility/explore
Authorization: Bearer {token}
Content-Type: application/json

{
  "archetype_id": "guardian" // optional, explores all if not provided
}
```

**Response:**
```json
{
  "compatibility": {
    "overall": 0.87,
    "similarity": 0.85,
    "complementarity": 0.78,
    "attachmentMatch": 0.90,
    "conflictMatch": 0.82,
    "socialMatch": 0.75,
    "valuesMatch": 0.88,
    "strengths": [
      "Strong emotional connection and security",
      "Excellent communication and conflict resolution"
    ],
    "challenges": [
      "Different social needs may require compromise"
    ],
    "insights": [
      "You share core similarities while bringing complementary strengths"
    ]
  },
  "archetype": {
    "id": "guardian",
    "name": "The Guardian",
    "description": "...",
    ...
  }
}
```

---

## Bonds API

### List Bonds (Couple Mode)
```http
GET /api/v1/soulmates/bonds
Authorization: Bearer {token}
```

**Response:**
```json
{
  "bonds": [
    {
      "id": "bond_id",
      "partner1_id": "user_id",
      "partner2_id": "partner_user_id",
      "compatibility_score": 0.87,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Get Bond Details
```http
GET /api/v1/soulmates/bonds/{bond_id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "bond": {
    "id": "bond_id",
    "partner1": {
      "id": "user_id",
      "primary_archetype": "The Guardian",
      ...
    },
    "partner2": {
      "id": "partner_user_id",
      "primary_archetype": "The Explorer",
      ...
    },
    "compatibility": {
      "overall": 0.87,
      ...
    },
    "resonance": {
      "metrics": [0.5, 0.6, ...] // 7-dimensional resonance vector
    }
  }
}
```

---

## Journaling API

### Get Journal Entries
```http
GET /api/v1/soulmates/journaling/entries
Authorization: Bearer {token}
```

**Response:**
```json
{
  "entries": [
    {
      "id": "entry_id",
      "content": "Journal entry text",
      "created_at": "2025-01-01T00:00:00Z",
      "tags": ["reflection", "growth"]
    }
  ]
}
```

### Create Journal Entry
```http
POST /api/v1/soulmates/journaling/entries
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Today I discovered...",
  "tags": ["reflection", "growth"]
}
```

**Response:**
```json
{
  "entry": {
    "id": "entry_id",
    "content": "Today I discovered...",
    "created_at": "2025-01-01T00:00:00Z",
    "tags": ["reflection", "growth"]
  }
}
```

---

## Billing API

### Get Subscription Plans
```http
GET /api/v1/soulmates/billing/plans
```

**Response:**
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "features": ["Basic compatibility test", "Limited explorations"]
    },
    {
      "id": "plus",
      "name": "Plus",
      "price": 9.99,
      "interval": "month",
      "features": ["Unlimited explorations", "Couple Mode", "Resonance Lab"]
    }
  ]
}
```

### Get User Subscription
```http
GET /api/v1/soulmates/billing/subscription
Authorization: Bearer {token}
```

**Response:**
```json
{
  "subscription": {
    "tier": "PLUS",
    "status": "active",
    "current_period_end": "2025-02-01T00:00:00Z"
  }
}
```

### Create Checkout Session
```http
POST /api/v1/soulmates/billing/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "plan_id": "plus",
  "success_url": "https://soulmates.syncscript.app/checkout/success",
  "cancel_url": "https://soulmates.syncscript.app/checkout/cancel"
}
```

**Response:**
```json
{
  "checkout_url": "https://checkout.stripe.com/..."
}
```

---

## Analytics API

### Track Event
```http
POST /api/soulmates/analytics
Content-Type: application/json

{
  "event_name": "test_completed",
  "payload": {
    "scenario_count": 32,
    "completion_time": 1200
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

## Email API

### Send Email
```http
POST /api/v1/soulmates/emails/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "user@example.com",
  "emailType": "welcome",
  "userName": "John Doe",
  "archetype": "The Guardian" // optional
}
```

**Email Types:**
- `welcome` - Welcome email on signup
- `test_completion_reminder` - Reminder when test completed but not authenticated
- `results_access` - Email when user authenticates after test
- `engagement` - Engagement email (3 days after signup)
- `reengagement` - Re-engagement email (7 days after last activity)

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "email_id"
}
```

---

## Error Handling

All API endpoints return errors in the following format:

```json
{
  "detail": "Error message",
  "error": "Error Type"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable

### Example Error Response

```json
{
  "detail": "Valid email address is required",
  "error": "Validation Error"
}
```

---

## Rate Limiting

- **Unauthenticated**: 10 requests per minute
- **Authenticated**: 100 requests per minute
- **Billing endpoints**: 20 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Data Models

### Trait Vector
32-dimensional array of floats (0-1 scale) representing:
- Traits 0-4: Attachment & Regulation
- Traits 5-9: Conflict & Communication
- Traits 10-14: Cognitive & Decision Style
- Traits 15-19: Value Architecture
- Traits 20-24: Social & Interpersonal Style
- Traits 25-28: Sexual System
- Traits 29-31: Life Structure

### Compatibility Score
```typescript
{
  overall: number; // 0-1
  similarity: number; // 0-1
  complementarity: number; // 0-1
  attachmentMatch: number; // 0-1
  conflictMatch: number; // 0-1
  socialMatch: number; // 0-1
  valuesMatch: number; // 0-1
  strengths: string[];
  challenges: string[];
  insights: string[];
}
```

---

## Client Libraries

### JavaScript/TypeScript

```typescript
import { api } from '@/lib/api';

// Get profile
const profile = await api.profile.get();

// Explore compatibility
const compatibility = await api.compatibility.explore({ archetype_id: 'guardian' });

// Create bond
const bond = await api.bonds.create({ partner2_id: 'partner_id' });
```

---

## Support

For API support, contact: support@soulmates.syncscript.app

---

**Last Updated**: January 2025

