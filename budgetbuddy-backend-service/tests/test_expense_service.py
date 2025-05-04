import unittest
from unittest.mock import patch
from services.expense_service import ExpenseService
from app import app  # Import your Flask app

class TestExpenseService(unittest.TestCase):

    def setUp(self):
        self.sample_data = {
            "amount": 100,
            "category": "Food",
            "date": "2024-05-01",
            "method": "Card",
            "notes": "Dinner"
        }
        self.token = "valid_token"
        self.uid = "user123"

    @patch("services.expense_service.ExpenseService.firebase")
    def test_add_expense_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.uid
        mock_firebase.db.collection.return_value.add.return_value = None

        with app.app_context():
            response, status = ExpenseService.add_expense(self.sample_data, self.token)
            self.assertEqual(status, 201)
            self.assertEqual(response.json["message"], "Expense added")

    @patch("services.expense_service.ExpenseService.firebase")
    def test_add_expense_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None

        with app.app_context():
            response, status = ExpenseService.add_expense(self.sample_data, self.token)
            self.assertEqual(status, 401)
            self.assertEqual(response.json["error"], "Unauthorized")

    @patch("services.expense_service.ExpenseService.firebase")
    def test_add_expense_invalid_data(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.uid
        bad_data = self.sample_data.copy()
        bad_data["amount"] = -10

        with app.app_context():
            response, status = ExpenseService.add_expense(bad_data, self.token)
            self.assertEqual(status, 400)
            self.assertIn("Amount must be a positive number", response.json["error"])

if __name__ == "__main__":
    unittest.main()
