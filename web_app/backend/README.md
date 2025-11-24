# B2B Monetization API Backend

FastAPI backend for B2B monetization features including API licensing, partner management, and usage tracking.

## Features

- ✅ **API Authentication**: API key-based authentication
- ✅ **Rate Limiting**: Tier-based rate limits (starter, professional, enterprise)
- ✅ **Partner Management**: Partner onboarding and API key management
- ✅ **Usage Tracking**: Comprehensive API usage analytics
- ✅ **Compatibility API**: v1 compatibility calculation endpoints
- ✅ **Batch Processing**: Batch compatibility calculations

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Up Database

```bash
# Create PostgreSQL database
createdb soulmate_b2b

# Run schema
psql soulmate_b2b < database/schema.sql
```

Or use SQLAlchemy to create tables:

```python
from database.connection import init_db
init_db()
```

### 3. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Update `DATABASE_URL` with your PostgreSQL connection string.

### 4. Run the API

```bash
# Development
uvicorn app:app --reload --port 8000

# Production
uvicorn app:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### Compatibility API (v1)

**POST** `/api/v1/compatibility/calculate`
- Calculate compatibility between two people
- Requires API key authentication
- Rate limited per tier

**POST** `/api/v1/compatibility/batch`
- Batch compatibility calculation (up to 100 pairs)
- Requires API key authentication
- Higher rate limits for enterprise

### Partner Management

**POST** `/api/v1/partners/`
- Create new partner account

**GET** `/api/v1/partners/{partner_id}`
- Get partner information

**POST** `/api/v1/partners/{partner_id}/api-keys`
- Create new API key

**GET** `/api/v1/partners/{partner_id}/api-keys`
- List API keys

**DELETE** `/api/v1/partners/{partner_id}/api-keys/{key_id}`
- Revoke API key

## Rate Limits

| Tier | Requests/Minute | Requests/Day | Batch Limit |
|------|----------------|--------------|-------------|
| Starter | 60 | 10,000 | 10 pairs |
| Professional | 300 | 100,000 | 50 pairs |
| Enterprise | 1,000 | 1,000,000 | 100 pairs |
| Research | 100 | 50,000 | 20 pairs |

## Authentication

All API endpoints (except partner creation) require API key authentication:

```bash
curl -X POST https://api.soulmates.syncscript.app/api/v1/compatibility/calculate \
  -H "X-API-Key: sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "person1": {"traits": [32D array]},
    "person2": {"traits": [32D array]}
  }'
```

## Database Schema

See `database/schema.sql` for complete schema.

Key tables:
- `partners` - Partner accounts
- `api_keys` - API keys (hashed)
- `api_usage` - Usage tracking
- `events` - Event sponsorship
- `partner_subscriptions` - Billing/subscriptions

## Development

### Running Tests

```bash
# TODO: Add tests
pytest tests/
```

### Code Structure

```
backend/
├── app.py                 # Main FastAPI application
├── api/
│   ├── auth.py           # Authentication & rate limiting
│   ├── analytics.py      # Usage tracking
│   └── v1/
│       ├── compatibility.py  # Compatibility API
│       └── partners.py        # Partner management
├── database/
│   ├── schema.sql        # Database schema
│   ├── models.py         # SQLAlchemy models
│   └── connection.py     # Database connection
└── requirements.txt      # Dependencies
```

## Deployment

### Render

See `render.yaml` for Render deployment configuration.

### Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `ENVIRONMENT` - `development` or `production`

Optional:
- `REDIS_URL` - For Redis-based rate limiting
- `STRIPE_SECRET_KEY` - For billing integration
- `ALLOWED_ORIGINS` - CORS allowed origins

## Next Steps

- [ ] Add Redis for rate limiting
- [ ] Implement Stripe billing integration
- [ ] Add event matching API
- [ ] Build data insights API
- [ ] Create partner portal frontend
- [ ] Add comprehensive tests
- [ ] Set up monitoring and logging

