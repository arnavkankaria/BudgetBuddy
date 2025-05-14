import unittest
from unittest.mock import patch, MagicMock
from flask import Flask
from services.recurring_service import RecurringService
import sys
import os
from datetime import datetime, timedelta
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

app = Flask(__name__)

class TestRecurringService(unittest.TestCase):
    def setUp(self):
        self.token = "valid_token"
        self.user_id = "test_user_id"
        self.recurring_id = str(uuid.uuid4())
        self.valid_data = {
            "amount": 15.99,
            "category": "Entertainment",
            "frequency": "monthly",
            "start_date": datetime.now().strftime("%Y-%m-%d"),
            "notes": "Netflix Subscription"
        }

    @patch("services.recurring_service.RecurringService.firebase")
    def test_add_recurring_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_doc_ref = MagicMock()
        mock_doc_ref.id = self.recurring_id
        mock_firebase.db.collection.return_value.document.return_value = mock_doc_ref

        with app.app_context():
            response, status = RecurringService.add_recurring_expense(self.token, self.valid_data)
            self.assertEqual(status, 201)
            self.assertIn("message", response.json)
            self.assertEqual(response.json["id"], self.recurring_id)

    @patch("services.recurring_service.RecurringService.firebase")
    def test_add_recurring_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None

        with app.app_context():
            response, status = RecurringService.add_recurring_expense(self.token, self.valid_data)
            self.assertEqual(status, 401)
            self.assertEqual(response.json["error"], "Unauthorized")

    @patch("services.recurring_service.RecurringService.firebase")
    def test_add_recurring_missing_fields(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        incomplete_data = {"amount": 15.99}  # Missing required fields

        with app.app_context():
            response, status = RecurringService.add_recurring_expense(self.token, incomplete_data)
            self.assertEqual(status, 400)
            self.assertIn("error", response.json)

    @patch("services.recurring_service.RecurringService.firebase")
    def test_list_recurring_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_doc = MagicMock()
        mock_doc.id = self.recurring_id
        mock_doc.to_dict.return_value = {
            "user_id": self.user_id,
            "amount": 15.99,
            "category": "Entertainment",
            "frequency": "monthly",
            "start_date": datetime.now().strftime("%Y-%m-%d"),
            "notes": "Netflix Subscription",
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        }
        mock_firebase.db.collection.return_value.where.return_value.stream.return_value = [mock_doc]

        with app.app_context():
            response, status = RecurringService.list_recurring_expenses(self.token)
            self.assertEqual(status, 200)
            self.assertIsInstance(response.json, list)
            self.assertEqual(len(response.json), 1)
            self.assertEqual(response.json[0]["id"], self.recurring_id)

    @patch("services.recurring_service.RecurringService.firebase")
    def test_list_recurring_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None

        with app.app_context():
            response, status = RecurringService.list_recurring_expenses(self.token)
            self.assertEqual(status, 401)
            self.assertEqual(response.json["error"], "Unauthorized")

    @patch("services.recurring_service.RecurringService.firebase")
    def test_edit_recurring_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {"user_id": self.user_id}
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = mock_doc

        with app.app_context():
            response, status = RecurringService.edit_recurring_expense(self.recurring_id, self.valid_data, self.token)
            self.assertEqual(status, 200)
            self.assertIn("message", response.json)

    @patch("services.recurring_service.RecurringService.firebase")
    def test_edit_recurring_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None

        with app.app_context():
            response, status = RecurringService.edit_recurring_expense(self.recurring_id, self.valid_data, self.token)
            self.assertEqual(status, 401)
            self.assertEqual(response.json["error"], "Unauthorized")

    @patch("services.recurring_service.RecurringService.firebase")
    def test_edit_recurring_not_found(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_doc = MagicMock()
        mock_doc.exists = False
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = mock_doc

        with app.app_context():
            response, status = RecurringService.edit_recurring_expense(self.recurring_id, self.valid_data, self.token)
            self.assertEqual(status, 404)
            self.assertIn("error", response.json)

    @patch("services.recurring_service.RecurringService.firebase")
    def test_delete_recurring_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {"user_id": self.user_id}
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = mock_doc

        with app.app_context():
            response, status = RecurringService.delete_recurring_expense(self.recurring_id, self.token)
            self.assertEqual(status, 200)
            self.assertIn("message", response.json)

    @patch("services.recurring_service.RecurringService.firebase")
    def test_delete_recurring_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None

        with app.app_context():
            response, status = RecurringService.delete_recurring_expense(self.recurring_id, self.token)
            self.assertEqual(status, 401)
            self.assertEqual(response.json["error"], "Unauthorized")

    @patch("services.recurring_service.RecurringService.firebase")
    def test_delete_recurring_not_found(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_doc = MagicMock()
        mock_doc.exists = False
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = mock_doc

        with app.app_context():
            response, status = RecurringService.delete_recurring_expense(self.recurring_id, self.token)
            self.assertEqual(status, 404)
            self.assertIn("error", response.json)

    @patch("services.recurring_service.RecurringService.firebase")
    def test_get_upcoming_payments_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_doc = MagicMock()
        mock_doc.id = self.recurring_id
        mock_doc.to_dict.return_value = {
            "user_id": self.user_id,
            "amount": 15.99,
            "category": "Entertainment",
            "frequency": "monthly",
            "start_date": datetime.now().strftime("%Y-%m-%d"),
            "notes": "Netflix Subscription",
            "status": "active"
        }
        mock_firebase.db.collection.return_value.where.return_value.where.return_value.stream.return_value = [mock_doc]

        with app.app_context():
            response, status = RecurringService.get_upcoming_payments(self.token)
            self.assertEqual(status, 200)
            self.assertIsInstance(response.json, list)
            self.assertEqual(len(response.json), 1)
            self.assertEqual(response.json[0]["id"], self.recurring_id)

    @patch("services.recurring_service.RecurringService.firebase")
    def test_get_upcoming_payments_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None

        with app.app_context():
            response, status = RecurringService.get_upcoming_payments(self.token)
            self.assertEqual(status, 401)
            self.assertEqual(response.json["error"], "Unauthorized")

    @patch("services.recurring_service.RecurringService.firebase")
    def test_update_status_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {"user_id": self.user_id}
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = mock_doc

        update_data = {"status": "paused"}
        with app.app_context():
            response, status = RecurringService.update_status(self.recurring_id, update_data, self.token)
            self.assertEqual(status, 200)
            self.assertIn("message", response.json)

    @patch("services.recurring_service.RecurringService.firebase")
    def test_update_status_invalid(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        update_data = {"status": "invalid_status"}

        with app.app_context():
            response, status = RecurringService.update_status(self.recurring_id, update_data, self.token)
            self.assertEqual(status, 400)
            self.assertIn("error", response.json)

if __name__ == "__main__":
    unittest.main()
