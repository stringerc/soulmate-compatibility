# Database Migration Guide

## Overview

This guide covers setting up and migrating the Soulmates database schema.

## Prerequisites

- PostgreSQL database
- `DATABASE_URL` environment variable set
- Python dependencies installed (`pip install -r requirements.txt`)

## Migration Steps

### 1. Create Database

```bash
# Using psql
createdb soulmate_db

# Or set DATABASE_URL
export DATABASE_URL="postgresql://user:password@localhost:5432/soulmate_db"
```

### 2. Run Migrations

```bash
cd web_app/backend

# Run soulmates migration
python scripts/migrate_soulmates.py

# Initialize default data (plans, etc.)
python scripts/init_soulmates_data.py
```

### 3. Verify Migration

```bash
# Connect to database
psql $DATABASE_URL

# Check tables
\dt

# Should see:
# - users
# - soul_profiles
# - compatibility_snapshots
# - relationship_bonds
# - bond_invites
# - soul_journey_entries
# - soulmates_plans
# - soulmates_subscriptions
# - organizations
# - organization_memberships
# - organization_plans
```

## Schema Overview

### Core Tables

- **users** - Base user table (shared with syncscript)
- **soul_profiles** - One per user, stores archetype, attachment style, values vector
- **compatibility_snapshots** - Compatibility calculations between pairs
- **relationship_bonds** - Active/past bonds between users
- **bond_invites** - Invitation system for bonds
- **soul_journey_entries** - Journaling entries

### Monetization Tables

- **soulmates_plans** - Plan definitions (FREE, PLUS, COUPLE_PREMIUM)
- **soulmates_subscriptions** - User/bond subscriptions
- **soulmates_deep_reports** - One-off paid reports

### B2B Tables

- **organizations** - Organizations for B2B features
- **organization_memberships** - User memberships in orgs
- **organization_plans** - Org-level subscriptions

## Rollback

If you need to rollback:

```sql
-- Drop all soulmates tables (CAUTION: This deletes all data!)
DROP TABLE IF EXISTS soulmates_deep_reports CASCADE;
DROP TABLE IF EXISTS organization_plans CASCADE;
DROP TABLE IF EXISTS organization_memberships CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS soulmates_subscriptions CASCADE;
DROP TABLE IF EXISTS soulmates_plans CASCADE;
DROP TABLE IF EXISTS soul_journey_entries CASCADE;
DROP TABLE IF EXISTS bond_invites CASCADE;
DROP TABLE IF EXISTS relationship_bonds CASCADE;
DROP TABLE IF EXISTS compatibility_snapshots CASCADE;
DROP TABLE IF EXISTS soul_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

## Troubleshooting

### Migration Fails

1. Check `DATABASE_URL` is set correctly
2. Verify database exists and is accessible
3. Check for existing tables that might conflict
4. Review error messages in migration script output

### Foreign Key Errors

If you see foreign key errors, ensure:
- `users` table exists (from syncscript or created by migration)
- All referenced tables are created in order

### Permission Errors

Ensure database user has:
- `CREATE TABLE` permission
- `CREATE INDEX` permission
- `ALTER TABLE` permission (for foreign keys)

## Development vs Production

### Development

- Can drop and recreate tables freely
- Use `migrate_soulmates.py` directly
- No data preservation needed

### Production

- Use proper migration tool (Alembic recommended for future)
- Backup database before migrations
- Test migrations on staging first
- Use transactions for safety

## Next Steps

After migration:

1. Initialize default plans: `python scripts/init_soulmates_data.py`
2. Verify API endpoints work
3. Test authentication flow
4. Create test users and profiles

