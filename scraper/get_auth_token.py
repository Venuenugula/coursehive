#!/usr/bin/env python3
"""
Get authentication token for the scraper
"""

import requests
import json
import sys

def get_auth_token(backend_url="http://localhost:5001"):
    """Register a user and get auth token"""
    try:
        # Register a user for the scraper
        user_data = {
            "name": "CourseHive Scraper",
            "email": "scraper@coursehive.com",
            "password": "scraper123456",
            "role": "admin"  # Give admin role to bypass restrictions
        }
        
        response = requests.post(f"{backend_url}/api/auth/register", json=user_data)
        
        if response.status_code in [200, 201]:
            data = response.json()
            return data.get('token')
        else:
            print(f"Registration failed: {response.status_code}")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"Error getting auth token: {e}")
        return None

if __name__ == "__main__":
    backend_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5001"
    token = get_auth_token(backend_url)
    
    if token:
        print(f"Auth token: {token}")
        # Save token to file
        with open('auth_token.txt', 'w') as f:
            f.write(token)
        print("Token saved to auth_token.txt")
    else:
        print("Failed to get auth token")
        sys.exit(1)
