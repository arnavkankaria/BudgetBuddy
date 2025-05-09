import unittest
from unittest.mock import patch, MagicMock, mock_open
from flask import Flask
from io import BytesIO
from services.data_service import DataService
import json

app = Flask(__name__)

class TestDataService(unittest.TestCase):

    def setUp(self):
        self.token = "valid_token"
        self.user_id = "user123"
        self.expense_json = [{"amount": 100, "category": "Food", "date": "2025-05-01", "method": "Card"}]
        self.expense_csv = "amount,category,date,method,notes\\n100,Food,2025-05-01,Card,\\n"

    @patch("services.data_service.DataService.firebase")
    def test_export_expenses_json(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.stream.return_value = []

        with app.app_context():
            response, status = DataService.export_expenses(self.token, "json")
            self.assertEqual(status, 200)
            self.assertIsInstance(response.json, list)

    @patch("services.data_service.DataService.firebase")
    def test_import_expenses_json_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.document.return_value.set.return_value = None
        file = MagicMock()
        file.filename = "expenses.json"
        file.read.return_value = b'[{"amount": 50, "category": "Transport", "date": "2025-05-02", "method": "Cash"}]'

        with app.app_context():
            response, status = DataService.import_expenses(self.token, file)
            self.assertEqual(status, 201)
            self.assertIn("message", response.json)

    @patch("services.data_service.DataService.firebase")
    def test_import_expenses_csv_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.document.return_value.set.return_value = None
        file = MagicMock()
        file.filename = "expenses.csv"
        file.read.return_value = self.expense_csv.encode()

        with app.app_context():
            response, status = DataService.import_expenses(self.token, file)
            self.assertEqual(status, 201)
            self.assertIn("message", response.json)

    @patch("services.data_service.DataService.firebase")
    def test_import_unsupported_file_type(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        file = MagicMock()
        file.filename = "expenses.txt"
        file.read.return_value = b"random content"

        with app.app_context():
            response, status = DataService.import_expenses(self.token, file)
            self.assertEqual(status, 400)
            self.assertIn("Unsupported file type", response.json["error"])

    @patch("services.data_service.DataService.firebase")
    def test_import_expenses_invalid_json(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        file = MagicMock()
        file.filename = "expenses.json"
        file.read.return_value = b"invalid json content"

        with app.app_context():
            response, status = DataService.import_expenses(self.token, file)
            self.assertEqual(status, 400)
            self.assertIn("Invalid JSON format", response.json["error"])

if __name__ == "__main__":
    unittest.main()
