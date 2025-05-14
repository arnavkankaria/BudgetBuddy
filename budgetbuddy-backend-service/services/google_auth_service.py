from google.oauth2 import id_token
from google.auth.transport import requests
from flask import jsonify
import os
from services.auth_service import AuthService

class GoogleAuthService:
    @staticmethod
    def verify_google_token(token):
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(token, requests.Request())
            
            # Get user info from the token
            user_info = {
                'email': idinfo['email'],
                'name': idinfo.get('name', ''),
                'picture': idinfo.get('picture', ''),
                'google_id': idinfo['sub']
            }
            
            # Check if user exists, if not create new user
            auth_response = AuthService.handle_google_user(user_info)
            return auth_response
            
        except ValueError as e:
            return jsonify({'error': 'Invalid token', 'message': str(e)}), 401
        except Exception as e:
            return jsonify({'error': 'Authentication failed', 'message': str(e)}), 500 