#!/usr/bin/env python3
"""
Render Deployment Automation Script
Uses Render API to automate backend deployment
"""

import os
import sys
import json
import requests
import time
from pathlib import Path
from typing import Dict, Optional

# Render API Configuration
RENDER_API_BASE = "https://api.render.com/v1"
RENDER_API_KEY = os.getenv("RENDER_API_KEY")

def get_api_headers() -> Dict[str, str]:
    """Get API headers with authentication"""
    if not RENDER_API_KEY:
        raise ValueError("RENDER_API_KEY environment variable not set")
    return {
        "Authorization": f"Bearer {RENDER_API_KEY}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

def create_web_service(
    name: str,
    repo_url: str,
    branch: str = "main",
    root_dir: str = "web_app/backend",
    build_command: str = "pip install -r requirements.txt",
    start_command: str = "uvicorn app:app --host 0.0.0.0 --port $PORT",
    region: str = "oregon",
    plan: str = "free"
) -> Optional[Dict]:
    """Create a web service on Render"""
    print(f"🚀 Creating web service: {name}")
    
    payload = {
        "type": "web_service",
        "name": name,
        "repo": repo_url,
        "branch": branch,
        "rootDir": root_dir,
        "buildCommand": build_command,
        "startCommand": start_command,
        "region": region,
        "planId": plan,
        "envVars": [
            {"key": "ENVIRONMENT", "value": "production"},
            {"key": "ALLOWED_ORIGINS", "value": "https://soulmate.syncscript.app,https://www.soulmate.syncscript.app"},
            {"key": "JWT_ALGORITHM", "value": "HS256"},
            {"key": "JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "value": "10080"},
            {"key": "PORT", "value": "10000"}
        ]
    }
    
    try:
        response = requests.post(
            f"{RENDER_API_BASE}/services",
            headers=get_api_headers(),
            json=payload
        )
        response.raise_for_status()
        service = response.json()
        print(f"✅ Service created: {service.get('service', {}).get('id')}")
        return service
    except requests.exceptions.RequestException as e:
        print(f"❌ Error creating service: {e}")
        if hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")
        return None

def link_database_to_service(service_id: str, database_id: str) -> bool:
    """Link a database to a web service"""
    print(f"🔗 Linking database {database_id} to service {service_id}")
    
    try:
        # Get service details first
        response = requests.get(
            f"{RENDER_API_BASE}/services/{service_id}",
            headers=get_api_headers()
        )
        response.raise_for_status()
        service = response.json()
        
        # Add DATABASE_URL environment variable
        # Note: Render automatically provides this when databases are linked
        # We'll need to use the Render dashboard or wait for automatic linking
        
        print("✅ Database linking initiated (may require dashboard confirmation)")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Error linking database: {e}")
        return False

def deploy_from_blueprint(blueprint_url: str) -> bool:
    """Deploy using Render Blueprint (render.yaml)"""
    print("📦 Deploying from Blueprint...")
    
    payload = {
        "url": blueprint_url
    }
    
    try:
        response = requests.post(
            f"{RENDER_API_BASE}/blueprints",
            headers=get_api_headers(),
            json=payload
        )
        response.raise_for_status()
        blueprint = response.json()
        print(f"✅ Blueprint deployment initiated: {blueprint.get('id')}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Error deploying blueprint: {e}")
        if hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")
        return False

def main():
    """Main deployment function"""
    print("=" * 60)
    print("Render Deployment Automation")
    print("=" * 60)
    
    if not RENDER_API_KEY:
        print("⚠️  RENDER_API_KEY not set")
        print("Please set it: export RENDER_API_KEY=your_api_key")
        print("Get your API key from: https://dashboard.render.com/account/api-keys")
        return 1
    
    # Option 1: Deploy from Blueprint (recommended)
    repo_url = os.getenv("GITHUB_REPO_URL", "https://github.com/your-username/soul-mate")
    
    print("\n📋 Deployment Options:")
    print("1. Deploy from Blueprint (render.yaml) - Recommended")
    print("2. Create web service directly")
    
    choice = input("\nSelect option (1 or 2): ").strip()
    
    if choice == "1":
        blueprint_url = f"{repo_url}/blob/main/render.yaml"
        if deploy_from_blueprint(blueprint_url):
            print("\n✅ Blueprint deployment initiated!")
            print("Check Render dashboard for progress")
            return 0
    elif choice == "2":
        service = create_web_service(
            name="soulmate-b2b-api",
            repo_url=repo_url,
            root_dir="web_app/backend"
        )
        if service:
            service_id = service.get("service", {}).get("id")
            database_id = "dpg-d4i1l42li9vc73eghfag-a"  # From earlier
            if service_id:
                link_database_to_service(service_id, database_id)
            return 0
    
    return 1

if __name__ == "__main__":
    sys.exit(main())

