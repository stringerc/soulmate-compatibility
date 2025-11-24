#!/usr/bin/env python3
"""
Generate a secure JWT secret key
"""

import secrets

def generate_jwt_secret():
    """Generate a secure random string for JWT secret"""
    return secrets.token_urlsafe(32)

if __name__ == "__main__":
    secret = generate_jwt_secret()
    print("JWT_SECRET_KEY=" + secret)
    print("\nCopy this value to your environment variables.")

