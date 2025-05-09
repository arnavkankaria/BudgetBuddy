
import unittest
from unittest.mock import patch, MagicMock
from flask import Flask
from services.budget_service import BudgetService

app = Flask(__name__)

class TestBudgetService(unittest.TestCase):

    def setUp(self):
        self.token = "valid_token"
        self.user_id = "user123"
        self.budget_id = "budget_1"
        self.budget_data = {
            "amount": 500,
            "category": "Food",
            "period": "monthly",
            "start_date": "2025-05-01",
            "end_date": "2025-05-31"
        }

    @patch("services.budget_service.BudgetService.firebase")
    def test_set_budget_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.add.return_value = None

        with app.app_context():
            response, status = BudgetService.set_budget(self.budget_data, self.token)
            self.assertEqual(status, 201)
            self.assertIn("message", response.json)

    @patch("services.budget_service.BudgetService.firebase")
    def test_get_budgets_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.stream.return_value = []

        with app.app_context():
            response, status = BudgetService.get_budgets(self.token)
            self.assertEqual(status, 200)
            self.assertIsInstance(response.json, list)

    @patch("services.budget_service.BudgetService.firebase")
    def test_delete_budget_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None

        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {"user_id": self.user_id}
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = mock_doc


        with app.app_context():
            response, status = BudgetService.delete_budget(self.budget_id, self.token)
            self.assertEqual(status, 401)
            self.assertEqual(response.json["error"], "Unauthorized")

    @patch("services.budget_service.BudgetService.firebase")
    def test_delete_budget_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.document.return_value.delete.return_value = None

        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {"user_id": self.user_id}
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = mock_doc


        with app.app_context():
            response, status = BudgetService.delete_budget(self.budget_id, self.token)
            self.assertEqual(status, 200)
            self.assertIn("message", response.json)

    @patch("services.budget_service.BudgetService.firebase")
    def test_update_budget_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.document.return_value.get.return_value.exists = True
        mock_firebase.db.collection.return_value.document.return_value.update.return_value = None

        mock_doc = MagicMock()
        mock_doc.exists = True
        mock_doc.to_dict.return_value = {"user_id": self.user_id}
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = mock_doc


        with app.app_context():
            response, status = BudgetService.edit_budget(self.budget_id, self.budget_data, self.token)
            self.assertEqual(status, 200)
            self.assertIn("message", response.json)

    @patch("services.budget_service.BudgetService.firebase")
    def test_update_budget_not_found(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.document.return_value.get.return_value.exists = False

        mock_doc = MagicMock()
        mock_doc.exists = False
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = mock_doc

        with app.app_context():
            response, status = BudgetService.edit_budget(self.budget_id, self.budget_data, self.token)
            self.assertEqual(status, 404)
            self.assertEqual(response.json["error"], "Not found or unauthorized")

if __name__ == "__main__":
    unittest.main()
