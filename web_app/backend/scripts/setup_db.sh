#!/bin/bash
# Database setup script for local development

set -e

echo "🚀 Setting up PostgreSQL database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Using default: postgresql://user:password@localhost:5432/soulmate_b2b"
    export DATABASE_URL="postgresql://user:password@localhost:5432/soulmate_b2b"
fi

# Extract database name from URL
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "📦 Database name: $DB_NAME"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Please install PostgreSQL client."
    exit 1
fi

# Run schema
echo "📝 Running database schema..."
psql $DATABASE_URL -f database/schema.sql

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Set DATABASE_URL in your .env file"
echo "2. Run: python scripts/init_db.py"
echo "3. Start the API: uvicorn app:app --reload"

