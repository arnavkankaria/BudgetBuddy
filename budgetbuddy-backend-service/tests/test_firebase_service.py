import unittest
from unittest.mock import patch, MagicMock
from services.firebase_service import FirebaseService

class TestFirebaseService(unittest.TestCase):

    @patch("services.firebase_service.auth.verify_id_token")
    def test_verify_user_token_valid(self, mock_verify):
        mock_verify.return_value = {"uid": "user123"}
        service = FirebaseService()
        uid = service.verify_user_token("valid_token")
        self.assertEqual(uid, "user123")

    @patch("services.firebase_service.auth.verify_id_token", side_effect=Exception("Invalid token"))
    def test_verify_user_token_invalid(self, mock_verify):
        service = FirebaseService()
        uid = service.verify_user_token("invalid_token")
        self.assertIsNone(uid)

    @patch("services.firebase_service.firebase_admin._apps", new=[])
    @patch("services.firebase_service.firebase_admin.initialize_app")
    @patch("services.firebase_service.credentials.Certificate")
    @patch("services.firebase_service.firestore.client")
    def test_firebase_initialization(self, mock_client, mock_cert, mock_init):
        mock_client.return_value.collection.return_value.document.return_value.set.return_value = None
        service = FirebaseService()
        mock_cert.assert_called_once_with("firebase_key.json")
        mock_init.assert_called_once()
        mock_client.assert_called_once()

if __name__ == "__main__":
    unittest.main()
