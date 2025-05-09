import unittest
from unittest.mock import patch, MagicMock
from flask import Flask
from services.recurring_service import RecurringService
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


app = Flask(__name__)

class TestRecurringService(unittest.TestCase):

    def setUp(self):
        self.token = "valid_token"
        self.user_id = "user123"
        self.recurring_id = "rec_1"
        self.valid_data = {
            "amount": 299,
            "category": "Subscription",
            "method": "Card",
            "day": 5,
            "notes": "Netflix monthly"
        }

    @patch("services.recurring_service.RecurringService.firebase")
    def test_add_recurring_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.document.return_value.set.return_value = None

        with app.app_context():
            response, status = RecurringService.add_recurring_expense(self.token, self.valid_data)
            self.assertEqual(status, 201)
            self.assertIn("message", response.json)

    @patch("services.recurring_service.RecurringService.firebase")
    def test_add_recurring_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None

        with app.app_context():
            response, status = RecurringService.add_recurring_expense(self.token, self.valid_data)
            self.assertEqual(status, 401)
            self.assertEqual(response.json["error"], "Unauthorized")

    @patch("services.recurring_service.RecurringService.firebase")
    def test_list_recurring_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.stream.return_value = []

        with app.app_context():
            response, status = RecurringService.list_recurring_expenses(self.token)
            self.assertEqual(status, 200)
            self.assertIsInstance(response.json, list)

    @patch("services.recurring_service.RecurringService.firebase")
    def test_edit_recurring_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None

        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {"user_id": self.user_id}
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = mock_doc


        with app.app_context():
            response, status = RecurringService.edit_recurring_expense(self.recurring_id, {}, self.token)
            self.assertEqual(status, 401)
            self.assertEqual(response.json["error"], "Unauthorized")

    @patch("services.recurring_service.RecurringService.firebase")
    def test_delete_recurring_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None

        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {"user_id": self.user_id}
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = mock_doc


        with app.app_context():
            response, status = RecurringService.delete_recurring_expense(self.recurring_id, self.token)
            self.assertEqual(status, 401)
            self.assertEqual(response.json["error"], "Unauthorized")

    @patch("services.recurring_service.RecurringService.firebase")
    def test_delete_recurring_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.document.return_value.delete.return_value = None

        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {"user_id": self.user_id}
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = mock_doc


        with app.app_context():
            response, status = RecurringService.delete_recurring_expense(self.recurring_id, self.token)
            self.assertEqual(status, 200)
            self.assertIn("message", response.json)

    @patch("services.recurring_service.RecurringService.firebase")
    def test_edit_recurring_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.document.return_value.get.return_value.exists = True
        mock_firebase.db.collection.return_value.document.return_value.update.return_value = None

        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {"user_id": self.user_id}
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = mock_doc

        with app.app_context():
            response, status = RecurringService.edit_recurring_expense(self.recurring_id, self.valid_data, self.token)
            self.assertEqual(status, 200)
            self.assertIn("message", response.json)

    @patch("services.recurring_service.RecurringService.firebase")
    def test_edit_recurring_not_found(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.document.return_value.get.return_value.exists = False

        mock_doc = MagicMock()
        mock_doc.exists = False
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = mock_doc

        with app.app_context():
            response, status = RecurringService.edit_recurring_expense(self.recurring_id, self.valid_data, self.token)
            self.assertEqual(status, 404)
            self.assertIn("error", response.json)

if __name__ == "__main__":
    unittest.main()
