import unittest
from unittest.mock import patch, MagicMock
from flask import Flask
from services.reminder_service import ReminderService
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


app = Flask(__name__)

class TestReminderService(unittest.TestCase):

    def setUp(self):
        self.token = "valid_token"
        self.user_id = "user123"
        self.reminder_id = "rem_1"
        self.valid_reminder = {
            "title": "Pay Rent",
            "day": 3,
            "message": "Don't forget to pay rent"
        }
        self.preferences = {
            "email_enabled": True,
            "sms_enabled": False
        }

    @patch("services.reminder_service.ReminderService.firebase")
    def test_set_reminder_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        with app.app_context():
            response, status = ReminderService.set_reminder(self.token, self.valid_reminder)
            self.assertEqual(status, 201)
            self.assertIn("message", response.json)

    @patch("services.reminder_service.ReminderService.firebase")
    def test_set_notification_preferences_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        with app.app_context():
            response, status = ReminderService.set_notification_preferences(self.token, self.preferences)
            self.assertEqual(status, 200)
            self.assertIn("message", response.json)

    @patch("services.reminder_service.ReminderService.firebase")
    def test_edit_reminder_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None
        with app.app_context():
            response, status = ReminderService.edit_reminder(self.reminder_id, {}, self.token)
            self.assertEqual(status, 401)
            self.assertEqual(response.json["error"], "Unauthorized")

    @patch("services.reminder_service.ReminderService.firebase")
    def test_delete_reminder_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None
        with app.app_context():
            response, status = ReminderService.delete_reminder(self.reminder_id, self.token)
            self.assertEqual(status, 401)
            self.assertEqual(response.json["error"], "Unauthorized")

    @patch("services.reminder_service.ReminderService.firebase")
    def test_list_reminders_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.stream.return_value = []
        with app.app_context():
            response, status = ReminderService.list_reminders(self.token)
            self.assertEqual(status, 200)
            self.assertIsInstance(response.json, list)

    @patch("services.reminder_service.ReminderService.firebase")
    def test_set_reminder_missing_fields(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        incomplete_data = {"title": "Pay Rent"}  # missing 'day' and 'message'

        with app.app_context():
            response, status = ReminderService.set_reminder(self.token, incomplete_data)
            self.assertEqual(status, 400)
            self.assertIn("Missing fields", response.json["error"])

    @patch("services.reminder_service.ReminderService.firebase")
    def test_edit_reminder_no_valid_fields(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        doc = MagicMock()
        doc.exists = True
        doc.to_dict.return_value = {"user_id": self.user_id}
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = doc

        with app.app_context():
            response, status = ReminderService.edit_reminder(self.reminder_id, {"invalid": 1}, self.token)
            self.assertEqual(status, 400)
            self.assertIn("No valid fields", response.json["error"])

    @patch("services.reminder_service.ReminderService.firebase")
    def test_edit_reminder_not_found(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        doc = MagicMock()
        doc.exists = False
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = doc

        with app.app_context():
            response, status = ReminderService.edit_reminder(self.reminder_id, {"title": "Updated"}, self.token)
            self.assertEqual(status, 404)
            self.assertIn("Not found", response.json["error"])

    @patch("services.reminder_service.ReminderService.firebase")
    def test_delete_reminder_not_found(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        doc = MagicMock()
        doc.exists = False
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = doc

        with app.app_context():
            response, status = ReminderService.delete_reminder(self.reminder_id, self.token)
            self.assertEqual(status, 404)
            self.assertIn("Not found", response.json["error"])





if __name__ == "__main__":
    unittest.main()
