import unittest
from unittest.mock import patch, MagicMock
from flask import json
from app import app
from services.google_auth_service import GoogleAuthService
from services.auth_service import AuthService
from firebase_admin import auth

class TestGoogleAuth(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        self.valid_google_token = "valid_google_token"
        self.invalid_google_token = "invalid_google_token"
        self.mock_user_info = {
            'email': 'test@example.com',
            'name': 'Test User',
            'picture': 'https://example.com/photo.jpg',
            'google_id': '123456789',
            'sub': '123456789'
        }

    @patch('google.oauth2.id_token.verify_oauth2_token')
    @patch('services.auth_service.auth')
    def test_successful_google_auth_existing_user(self, mock_auth, mock_verify_token):
        print("Running test_successful_google_auth_existing_user...")
        # Mock Google token verification
        mock_verify_token.return_value = self.mock_user_info
        
        # Mock Firebase user lookup
        mock_user = MagicMock()
        mock_user.uid = "test_uid"
        mock_auth.get_user_by_email.return_value = mock_user
        
        # Mock custom token creation
        mock_auth.create_custom_token.return_value = "firebase_custom_token"
        
        # Make request to Google auth endpoint
        response = self.app.post('/auth/google',
                               data=json.dumps({'token': self.valid_google_token}),
                               content_type='application/json')
        print("Response status:", response.status_code)
        print("Response data:", response.data)
        # Assert response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'Login successful')
        self.assertEqual(data['uid'], 'test_uid')
        self.assertEqual(data['token'], 'firebase_custom_token')
        
        # Verify mocks were called correctly
        mock_verify_token.assert_called_once()
        mock_auth.get_user_by_email.assert_called_once_with('test@example.com')
        mock_auth.create_custom_token.assert_called_once_with('test_uid')

    @patch('google.oauth2.id_token.verify_oauth2_token')
    @patch('services.auth_service.auth')
    @patch('services.auth_service.AuthService.firebase')
    def test_successful_google_auth_new_user(self, mock_firebase, mock_auth, mock_verify_token):
        print("Running test_successful_google_auth_new_user...")
        # Mock Google token verification
        mock_verify_token.return_value = self.mock_user_info
        
        # Mock Firebase user lookup to raise Exception with 'not found' message
        mock_auth.get_user_by_email.side_effect = Exception('User not found')
        
        # Mock new user creation
        mock_user_record = MagicMock()
        mock_user_record.uid = "new_test_uid"
        mock_user_record.email = self.mock_user_info['email']
        mock_user_record.display_name = self.mock_user_info['name']
        mock_user_record.photo_url = self.mock_user_info['picture']
        mock_auth.create_user.return_value = mock_user_record
        
        # Mock custom token creation
        mock_auth.create_custom_token.return_value = "new_firebase_custom_token"
        
        # Mock Firestore document
        mock_doc = MagicMock()
        mock_firebase.db.collection.return_value.document.return_value = mock_doc
        
        # Make request to Google auth endpoint
        response = self.app.post('/auth/google',
                               data=json.dumps({'token': self.valid_google_token}),
                               content_type='application/json')
        print("Response status:", response.status_code)
        print("Response data:", response.data)
        # Assert response
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'User registered')
        self.assertEqual(data['uid'], 'new_test_uid')
        self.assertEqual(data['token'], 'new_firebase_custom_token')
        
        # Verify mocks were called correctly
        mock_verify_token.assert_called_once()
        mock_auth.get_user_by_email.assert_called_once_with('test@example.com')
        mock_auth.create_user.assert_called_once_with(
            email=self.mock_user_info['email'],
            display_name=self.mock_user_info['name'],
            photo_url=self.mock_user_info['picture'],
            email_verified=True
        )
        mock_firebase.db.collection.assert_called_once_with("users")
        mock_doc.set.assert_called_once()

    @patch('google.oauth2.id_token.verify_oauth2_token')
    def test_invalid_google_token(self, mock_verify_token):
        print("Running test_invalid_google_token...")
        # Mock Google token verification to raise ValueError
        mock_verify_token.side_effect = ValueError('Invalid token')
        
        # Make request to Google auth endpoint
        response = self.app.post('/auth/google',
                               data=json.dumps({'token': self.invalid_google_token}),
                               content_type='application/json')
        print("Response status:", response.status_code)
        print("Response data:", response.data)
        # Assert response
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'Invalid token')
        
        # Verify mock was called
        mock_verify_token.assert_called_once()

    def test_missing_token(self):
        print("Running test_missing_token...")
        # Make request to Google auth endpoint without token
        response = self.app.post('/auth/google',
                               data=json.dumps({}),
                               content_type='application/json')
        print("Response status:", response.status_code)
        print("Response data:", response.data)
        # Assert response
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'Missing Google token')

    @patch('google.oauth2.id_token.verify_oauth2_token')
    @patch('services.auth_service.auth')
    def test_firebase_error(self, mock_auth, mock_verify_token):
        print("Running test_firebase_error...")
        # Mock Google token verification
        mock_verify_token.return_value = self.mock_user_info
        
        # Mock Firebase to raise an exception that doesn't contain 'not found'
        mock_auth.get_user_by_email.side_effect = Exception('Firebase error')
        
        # Make request to Google auth endpoint
        response = self.app.post('/auth/google',
                               data=json.dumps({'token': self.valid_google_token}),
                               content_type='application/json')
        print("Response status:", response.status_code)
        print("Response data:", response.data)
        # Assert response
        self.assertEqual(response.status_code, 500)
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'Firebase error')
        
        # Verify mocks were called
        mock_verify_token.assert_called_once()
        mock_auth.get_user_by_email.assert_called_once_with('test@example.com')

if __name__ == '__main__':
    unittest.main() 