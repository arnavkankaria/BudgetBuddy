import unittest
from unittest.mock import patch, MagicMock
from flask import Flask
from services.expense_service import ExpenseService

app = Flask(__name__)

class TestExpenseService(unittest.TestCase):

    def setUp(self):
        self.token = "valid_token"
        self.user_id = "user123"
        self.expense_id = "exp_1"
        self.valid_expense = {
            "amount": 100,
            "category": "Food",
            "date": "2025-05-01",
            "method": "Card",
            "notes": "Lunch at Subway"
        }

    @patch("services.email_service.smtplib.SMTP")
    @patch("services.expense_service.ExpenseService.firebase")
    @patch("services.expense_service.ExpenseValidator.validate_expense_input", return_value=(True, "Valid"))
    @patch("services.expense_service.ExpenseClassifier.classify", return_value="Food")
    def test_add_expense_success(self, mock_classifier, mock_validator, mock_firebase, mock_smtp):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.add.return_value = None
        mock_firebase.db.collection.return_value.where.return_value.stream.return_value = []
        mock_firebase.db.collection.return_value.document.return_value.get.return_value.to_dict.return_value = {
            "email": "user@example.com"
        }

        with app.app_context():
            response, status = ExpenseService.add_expense(self.valid_expense, self.token)
            self.assertEqual(status, 201)
            self.assertIn("message", response.json)

    @patch("services.expense_service.ExpenseService.firebase")
    def test_list_expenses_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.stream.return_value = []

        with app.app_context():
            response, status = ExpenseService.list_expenses(self.token)
            self.assertEqual(status, 200)
            self.assertIsInstance(response.json, list)

    @patch("services.expense_service.ExpenseService.firebase")
    def test_delete_expense_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None

        with app.app_context():
            response, status = ExpenseService.delete_expense(self.expense_id, self.token)
            self.assertEqual(status, 401)
            self.assertEqual(response.json["error"], "Unauthorized")

    @patch("services.expense_service.ExpenseService.firebase")
    def test_filter_by_category_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.where.return_value.stream.return_value = []

        with app.app_context():
            response, status = ExpenseService.filter_by_category(self.token, "Food")
            self.assertEqual(status, 200)
            self.assertIsInstance(response.json, list)

    @patch("services.expense_service.ExpenseService.firebase")
    def test_filter_by_date_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.where.return_value.stream.return_value = []

        with app.app_context():
            response, status = ExpenseService.filter_by_date(self.token, "2025-05-01")
            self.assertEqual(status, 200)
            self.assertIsInstance(response.json, list)

    @patch("services.expense_service.ExpenseService.firebase")
    def test_filter_by_method_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.where.return_value.stream.return_value = []

        with app.app_context():
            response, status = ExpenseService.filter_by_method(self.token, "Card")
            self.assertEqual(status, 200)
            self.assertIsInstance(response.json, list)

    @patch("services.expense_service.ExpenseService.firebase")
    def test_update_expense_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        doc_mock = MagicMock()
        doc_mock.exists = True
        doc_mock.to_dict.return_value = {"user_id": self.user_id}
        mock_firebase.db.collection.return_value.document.return_value.get.return_value = doc_mock
        mock_firebase.db.collection.return_value.document.return_value.update.return_value = None

        with app.app_context():
            response, status = ExpenseService.edit_expense(self.expense_id, self.valid_expense, self.token)
            self.assertEqual(status, 200)
            self.assertIn("message", response.json)

    @patch("services.expense_service.ExpenseService.firebase")
    def test_update_expense_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None

        with app.app_context():
            response, status = ExpenseService.edit_expense(self.expense_id, self.valid_expense, self.token)
            self.assertEqual(status, 401)
            self.assertEqual(response.json["error"], "Unauthorized")

if __name__ == "__main__":
    unittest.main()
