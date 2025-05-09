import unittest
from unittest.mock import patch, MagicMock
from flask import Flask
from services.report_service import ReportService
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

app = Flask(__name__)

class TestReportService(unittest.TestCase):

    def setUp(self):
        self.token = "valid_token"
        self.user_id = "user123"
        self.month = "2025-05"

    @patch("services.report_service.ReportService.firebase")
    def test_generate_monthly_report_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.stream.return_value = []

        with app.app_context():
            response, status = ReportService.generate_monthly_report(self.token, self.month)
            self.assertEqual(status, 200)
            self.assertIn("month", response.json)
            self.assertIn("summary", response.json)

    @patch("services.report_service.ReportService.firebase")
    def test_generate_monthly_report_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None
        with app.app_context():
            response, status = ReportService.generate_monthly_report("bad_token", self.month)
            self.assertEqual(status, 401)
            self.assertIn("error", response.json)

    @patch("services.report_service.ReportService.firebase")
    def test_generate_monthly_report_invalid_date(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.stream.return_value = [
            MagicMock(to_dict=lambda: {"date": "bad-date", "amount": 100, "category": "Food"})
        ]
        with app.app_context():
            response, status = ReportService.generate_monthly_report(self.token, self.month)
            self.assertEqual(status, 200)
            self.assertEqual(response.json["summary"], {})

    @patch("services.report_service.ReportService.firebase")
    def test_generate_weekly_insights_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.stream.return_value = [
            MagicMock(to_dict=lambda: {"category": "Food", "date": "2025-04-30", "amount": 100.0}),
            MagicMock(to_dict=lambda: {"category": "Food", "date": "2025-05-01", "amount": 200.0})
        ]

        with app.app_context():
            response, status = ReportService.generate_weekly_insights(self.token)
            self.assertEqual(status, 200)
            self.assertIn("insights", response.json)
            self.assertIn("Food", response.json["insights"])

    @patch("services.report_service.ReportService.firebase")
    def test_generate_weekly_insights_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None
        with app.app_context():
            response, status = ReportService.generate_weekly_insights(self.token)
            self.assertEqual(status, 401)
            self.assertIn("error", response.json)

    @patch("services.report_service.ReportService.firebase")
    def test_generate_weekly_insights_new_spending(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.stream.return_value = [
            MagicMock(to_dict=lambda: {"category": "NewCat", "date": "2025-05-09", "amount": 200.0})
        ]

        with app.app_context():
            response, status = ReportService.generate_weekly_insights(self.token)
            self.assertEqual(status, 200)
            self.assertIn("NewCat", response.json["insights"])
            self.assertEqual(response.json["insights"]["NewCat"], "New spending")


    @patch("services.report_service.ReportService.firebase")
    def test_generate_weekly_insights_empty(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.stream.return_value = []
        with app.app_context():
            response, status = ReportService.generate_weekly_insights(self.token)
            self.assertEqual(status, 200)
            self.assertEqual(response.json, {"insights": {}})

    @patch("services.report_service.ReportService.firebase")
    @patch("services.report_service.pdfkit.from_string", return_value=b"PDF")
    def test_generate_pdf_report_success(self, mock_pdfkit, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.stream.return_value = [
            MagicMock(to_dict=lambda: {"amount": 100, "category": "Food", "date": "2025-05-05"})
        ]
        with app.test_request_context():
            response = ReportService.generate_pdf_report(self.token, self.month)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.mimetype, "application/pdf")

    @patch("services.report_service.ReportService.firebase")
    def test_generate_pdf_report_invalid_month(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        with app.test_request_context():
            response, status = ReportService.generate_pdf_report(self.token, "invalid")
            self.assertEqual(status, 400)
            self.assertIn("Invalid month format", response.json["error"])

    @patch("services.report_service.ReportService.firebase")
    def test_generate_pdf_report_unauthorized(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None
        with app.test_request_context():
            response, status = ReportService.generate_pdf_report(self.token, self.month)
            self.assertEqual(status, 401)
            self.assertIn("error", response.json)

if __name__ == "__main__":
    unittest.main()
