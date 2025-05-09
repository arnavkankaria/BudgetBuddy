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
    def test_delete_budget_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        doc = MagicMock()
        doc.exists = True
        doc.to_dict.return_value = {"user_id": self.user_id}
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = doc

        with app.app_context():
            response, status = BudgetService.delete_budget(self.budget_id, self.token)
            self.assertEqual(status, 200)
            self.assertIn("message", response.json)

    @patch("services.budget_service.BudgetService.firebase")
    def test_delete_budget_not_found(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        doc = MagicMock()
        doc.exists = False
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = doc

        with app.app_context():
            response, status = BudgetService.delete_budget(self.budget_id, self.token)
            self.assertEqual(status, 404)
            self.assertIn("error", response.json)

    @patch("services.budget_service.BudgetService.firebase")
    def test_edit_budget_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        doc = MagicMock()
        doc.exists = True
        doc.to_dict.return_value = {"user_id": self.user_id}
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = doc

        with app.app_context():
            response, status = BudgetService.edit_budget(self.budget_id, {"amount": 1000}, self.token)
            self.assertEqual(status, 200)
            self.assertIn("message", response.json)

    @patch("services.budget_service.BudgetService.firebase")
    def test_edit_budget_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None
        with app.app_context():
            response, status = BudgetService.edit_budget(self.budget_id, {"amount": 1000}, self.token)
            self.assertEqual(status, 401)

    @patch("services.budget_service.BudgetService.firebase")
    def test_edit_budget_not_found(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        doc = MagicMock()
        doc.exists = False
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = doc

        with app.app_context():
            response, status = BudgetService.edit_budget(self.budget_id, {"amount": 1000}, self.token)
            self.assertEqual(status, 404)

    @patch("services.budget_service.BudgetService.firebase")
    def test_edit_budget_no_valid_fields(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        doc = MagicMock()
        doc.exists = True
        doc.to_dict.return_value = {"user_id": self.user_id}
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = doc

        with app.app_context():
            response, status = BudgetService.edit_budget(self.budget_id, {"invalid": 123}, self.token)
            self.assertEqual(status, 400)
            self.assertIn("No valid fields", response.json["error"])

if __name__ == "__main__":
    unittest.main()
