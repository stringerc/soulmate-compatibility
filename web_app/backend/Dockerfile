# Dockerfile for B2B API Backend
FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Render will set PORT env var)
EXPOSE 8000

# Run database initialization and start server
CMD python scripts/init_db.py && uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}

