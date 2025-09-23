#!/usr/bin/env python3
"""
Login and get authentication token for the scraper
"""

import requests
import json
import sys

def login_and_get_token(backend_url="http://localhost:5001"):
    """Login and get auth token"""
    try:
        # Login with existing user
        login_data = {
            "email": "scraper@coursehive.com",
            "password": "scraper123456"
        }
        
        response = requests.post(f"{backend_url}/api/auth/login", json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            return data.get('token')
        else:
            print(f"Login failed: {response.status_code}")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"Error getting auth token: {e}")
        return None

if __name__ == "__main__":
    backend_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5001"
    token = login_and_get_token(backend_url)
    
    if token:
        print(f"Auth token: {token}")
        # Save token to file
        with open('auth_token.txt', 'w') as f:
            f.write(token)
        print("Token saved to auth_token.txt")
    else:
        print("Failed to get auth token")
        sys.exit(1)
