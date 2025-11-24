-- B2B Monetization Database Schema
-- PostgreSQL schema for partner management, API keys, and usage tracking

-- Partners table
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    tier VARCHAR(50) NOT NULL DEFAULT 'starter', -- starter, professional, enterprise
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, suspended, cancelled
    ip_whitelist TEXT[], -- Array of allowed IPs (optional)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_tier CHECK (tier IN ('starter', 'professional', 'enterprise', 'research')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'suspended', 'cancelled', 'trial'))
);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    key_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash of API key
    name VARCHAR(255) NOT NULL, -- User-friendly name for the key
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP,
    CONSTRAINT key_not_revoked CHECK (revoked_at IS NULL OR revoked_at > created_at)
);

-- Create index on key_hash for fast lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_partner ON api_keys(partner_id);

-- API Usage tracking table
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time INTEGER, -- milliseconds
    status_code INTEGER NOT NULL,
    request_size INTEGER, -- bytes
    response_size INTEGER, -- bytes
    timestamp TIMESTAMP DEFAULT NOW(),
    metadata JSONB, -- Additional context (IP, user agent, etc.)
    CONSTRAINT valid_method CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH'))
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_api_usage_partner ON api_usage(partner_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage(endpoint, timestamp);
CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp ON api_usage(timestamp);

-- Events table (for event sponsorship)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP,
    location VARCHAR(255),
    attendee_count INTEGER DEFAULT 0,
    matched BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Event Matches table
CREATE TABLE IF NOT EXISTS event_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    attendee1_id VARCHAR(255) NOT NULL,
    attendee2_id VARCHAR(255) NOT NULL,
    compatibility_score FLOAT NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 1),
    dimension_breakdown JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_match UNIQUE (event_id, attendee1_id, attendee2_id)
);

CREATE INDEX IF NOT EXISTS idx_event_matches_event ON event_matches(event_id);
CREATE INDEX IF NOT EXISTS idx_event_matches_score ON event_matches(compatibility_score DESC);

-- Rate limiting tracking (for Redis fallback)
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    window_type VARCHAR(20) NOT NULL, -- 'minute', 'hour', 'day'
    window_start TIMESTAMP NOT NULL,
    request_count INTEGER DEFAULT 0,
    PRIMARY KEY (partner_id, window_type, window_start),
    CONSTRAINT valid_window CHECK (window_type IN ('minute', 'hour', 'day'))
);

-- Partner billing/subscription table
CREATE TABLE IF NOT EXISTS partner_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    plan_type VARCHAR(50) NOT NULL, -- 'api', 'event', 'research', 'corporate'
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_plan CHECK (plan_type IN ('api', 'event', 'research', 'corporate', 'enterprise'))
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_partner ON partner_subscriptions(partner_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON partner_subscriptions(stripe_subscription_id);

-- Anonymized compatibility results (for research insights)
CREATE TABLE IF NOT EXISTS anonymized_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compatibility_score FLOAT NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 1),
    trait_compatibility FLOAT,
    resonance_compatibility FLOAT,
    dimension_breakdown JSONB,
    demographics JSONB, -- age_range, region, etc. (no PII)
    created_at TIMESTAMP DEFAULT NOW(),
    anonymized_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anonymized_score ON anonymized_results(compatibility_score);
CREATE INDEX IF NOT EXISTS idx_anonymized_created ON anonymized_results(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON partner_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

