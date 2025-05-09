import unittest
from unittest.mock import patch, MagicMock
from flask import Flask
from services.data_service import DataService

app = Flask(__name__)

class TestDataService(unittest.TestCase):

    def setUp(self):
        self.token = "valid_token"
        self.user_id = "user123"

    @patch("services.data_service.DataService.firebase")
    def test_import_expenses_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None
        file = MagicMock()
        file.filename = "expenses.json"
        with app.app_context():
            response, status = DataService.import_expenses("invalid_token", file)
            self.assertEqual(status, 401)

    @patch("services.data_service.DataService.firebase")
    def test_import_expenses_no_file(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        with app.app_context():
            response, status = DataService.import_expenses(self.token, None)
            self.assertEqual(status, 400)
            self.assertIn("No file uploaded", response.json["error"])

    @patch("services.data_service.DataService.firebase")
    def test_import_expenses_unsupported_file(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        file = MagicMock()
        file.filename = "expenses.txt"
        file.read.return_value = b"irrelevant"
        with app.app_context():
            response, status = DataService.import_expenses(self.token, file)
            self.assertEqual(status, 400)
            self.assertIn("Unsupported file type", response.json["error"])

    @patch("services.data_service.DataService.firebase")
    def test_import_expenses_invalid_json(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        file = MagicMock()
        file.filename = "expenses.json"
        file.read.return_value = b'{"invalid": [}'  # malformed JSON
        with app.app_context():
            response, status = DataService.import_expenses(self.token, file)
            self.assertEqual(status, 400)
            self.assertIn("Invalid JSON format", response.json["error"])

    @patch("services.data_service.DataService.firebase")
    def test_import_expenses_csv_missing_column(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        file = MagicMock()
        file.filename = "expenses.csv"
        file.read.return_value = b"amount,date,method\n100,2025-05-01,Cash"
        with app.app_context():
            response, status = DataService.import_expenses(self.token, file)
            self.assertEqual(status, 400)
            self.assertIn("CSV format error", response.json["error"])

    @patch("services.data_service.DataService.firebase")
    def test_import_expenses_csv_invalid_amount(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        file = MagicMock()
        file.filename = "expenses.csv"
        file.read.return_value = b"amount,category,date,method,notes\nabc,Food,2025-05-01,Cash,Lunch"
        with app.app_context():
            response, status = DataService.import_expenses(self.token, file)
            self.assertEqual(status, 400)
            self.assertIn("invalid amount field", response.json["error"])

    @patch("services.data_service.DataService.firebase")
    def test_import_expenses_valid_json(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.document.return_value.set.return_value = None
        file = MagicMock()
        file.filename = "expenses.json"
        file.read.return_value = b'''
        [
            {"amount": 100, "category": "Food", "date": "2025-05-01", "method": "Cash"}
        ]
        '''
        with app.app_context():
            response, status = DataService.import_expenses(self.token, file)
            self.assertEqual(status, 201)
            self.assertIn("message", response.json)

    @patch("services.data_service.DataService.firebase")
    def test_import_expenses_valid_csv(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.document.return_value.set.return_value = None
        file = MagicMock()
        file.filename = "expenses.csv"
        file.read.return_value = (
            b"amount,category,date,method,notes\n"
            b"100,Food,2025-05-01,Cash,Lunch\n"
        )
        with app.app_context():
            response, status = DataService.import_expenses(self.token, file)
            self.assertEqual(status, 201)
            self.assertIn("message", response.json)

    @patch("services.data_service.DataService.firebase")
    def test_export_expenses_csv(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_expenses = [MagicMock(to_dict=lambda: {
            "amount": 100, "category": "Food", "date": "2025-05-01", "method": "Cash", "notes": "Lunch"
        })]
        mock_firebase.db.collection.return_value.where.return_value.stream.return_value = mock_expenses
        with app.test_request_context():
            response = DataService.export_expenses(self.token, "csv")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.mimetype, "text/csv")

    @patch("services.data_service.DataService.firebase")
    def test_export_expenses_json_empty(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.stream.return_value = []
        with app.app_context():
            response, status = DataService.export_expenses(self.token, "json")
            self.assertEqual(status, 200)
            self.assertEqual(response.json, [])

if __name__ == "__main__":
    unittest.main()
