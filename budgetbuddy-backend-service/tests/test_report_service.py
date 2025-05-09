import unittest
from unittest.mock import patch, MagicMock
from flask import Flask
from services.report_service import ReportService

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
    def test_generate_weekly_insights_success(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.stream.return_value = []

        with app.app_context():
            response, status = ReportService.generate_weekly_insights(self.token)
            self.assertEqual(status, 200)
            self.assertIn("insights", response.json)

    @patch("services.report_service.ReportService.firebase")
    @patch("services.report_service.pdfkit.from_string", return_value=b"PDF bytes")
    def test_generate_pdf_report_success(self, mock_pdfkit, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.stream.return_value = []

        with app.test_request_context():
            response = ReportService.generate_pdf_report(self.token, self.month)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.mimetype, "application/pdf")

if __name__ == "__main__":
    unittest.main()
