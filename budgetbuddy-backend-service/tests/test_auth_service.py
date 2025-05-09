import unittest
from unittest.mock import patch, MagicMock
from flask import Flask
from services.auth_service import AuthService
from firebase_admin import auth

app = Flask(__name__)

class TestAuthService(unittest.TestCase):

    def setUp(self):
        self.valid_user_data = {
            "email": "test@example.com",
            "password": "secure123",
            "display_name": "Test User"
        }
        self.invalid_user_data = {
            "email": "test@example.com",
            "password": "123"  # too short
        }
        self.valid_token = "valid_token"
        self.invalid_token = "invalid_token"
        self.uid = "user123"

    @patch("services.auth_service.AuthService.firebase")
    @patch("services.auth_service.auth.create_user")
    def test_register_user_success(self, mock_create_user, mock_firebase):
        mock_create_user.return_value = MagicMock(uid=self.uid)
        mock_firebase.db.collection.return_value.document.return_value.set.return_value = None

        with app.app_context():
            response, status = AuthService.register_user(self.valid_user_data)
            self.assertEqual(status, 201)
            self.assertEqual(response.json["uid"], self.uid)

    def test_register_user_invalid_password(self):
        with app.app_context():
            response, status = AuthService.register_user(self.invalid_user_data)
            self.assertEqual(status, 400)
            self.assertIn("Password must be at least 6 characters", response.json["error"])

    def test_register_user_missing_keys(self):
        with app.app_context():
            response, status = AuthService.register_user({"email": "a@b.com"})
            self.assertEqual(status, 400)
            self.assertIn("Missing required field", response.json["error"])

    @patch("services.auth_service.auth.create_user", side_effect=Exception("Creation failed"))
    @patch("services.auth_service.AuthService.firebase")
    def test_register_user_exception(self, mock_firebase, mock_create_user):
        mock_firebase.db.collection.return_value.document.return_value.set.return_value = None
        data = {
            "email": "test@example.com",
            "password": "secure123",
            "display_name": "Test User"
        }

        with app.app_context():
            response, status = AuthService.register_user(data)
            self.assertEqual(status, 400)
            self.assertIn("Creation failed", response.json["error"])



    @patch("services.auth_service.AuthService.firebase")
    def test_login_user_valid_token(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.uid
        with app.app_context():
            response, status = AuthService.login_user({"token": self.valid_token})
            self.assertEqual(status, 200)
            self.assertEqual(response.json["uid"], self.uid)

    @patch("services.auth_service.AuthService.firebase")
    def test_login_user_invalid_token(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None
        with app.app_context():
            response, status = AuthService.login_user({"token": self.invalid_token})
            self.assertEqual(status, 401)
            self.assertEqual(response.json["error"], "Invalid token")

    @patch("services.auth_service.AuthService.firebase")
    @patch("services.auth_service.auth.delete_user")
    def test_delete_user_success(self, mock_delete_user, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.uid
        mock_firebase.db.collection.return_value.document.return_value.delete.return_value = None
        with app.app_context():
            response, status = AuthService.delete_user(self.valid_token)
            self.assertEqual(status, 200)
            self.assertEqual(response.json["message"], "User account deleted")

    @patch("services.auth_service.AuthService.firebase")
    def test_delete_user_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None
        with app.app_context():
            response, status = AuthService.delete_user(self.invalid_token)
            self.assertEqual(status, 401)
            self.assertEqual(response.json["error"], "Unauthorized")

if __name__ == "__main__":
    unittest.main()
