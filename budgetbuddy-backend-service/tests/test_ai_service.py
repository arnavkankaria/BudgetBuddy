
import unittest
from unittest.mock import patch, MagicMock
from flask import Flask
from services.ai_service import AIService

app = Flask(__name__)

class TestAIService(unittest.TestCase):

    def setUp(self):
        self.token = "valid_token"
        self.user_id = "user123"

    @patch("services.ai_service.AIService.firebase")
    def test_generate_suggestions_high_spend(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_expenses = [
            MagicMock(to_dict=lambda: {"amount": 150, "category": "Food", "date": "2025-05-15"}),
            MagicMock(to_dict=lambda: {"amount": 50, "category": "Food", "date": "2025-04-10"}),
            MagicMock(to_dict=lambda: {"amount": 60, "category": "Food", "date": "2025-03-12"})
        ]
        mock_firebase.db.collection.return_value.where.return_value.stream.side_effect = [
            iter(mock_expenses),  # for expenses
            iter([])              # for recurring
        ]

        with app.app_context():
            response, status = AIService.generate_suggestions(self.token)
            self.assertEqual(status, 200)
            self.assertTrue(any("Food" in s for s in response.json["suggestions"]))

    @patch("services.ai_service.AIService.firebase")
    def test_generate_suggestions_multiple_subscriptions(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.stream.side_effect = [
            iter([]),  # no expenses
            iter([
                MagicMock(to_dict=lambda: {"notes": "spotify"}),
                MagicMock(to_dict=lambda: {"notes": "netflix"}),
                MagicMock(to_dict=lambda: {"notes": "prime"})
            ])
        ]

        with app.app_context():
            response, status = AIService.generate_suggestions(self.token)
            self.assertEqual(status, 200)
            self.assertTrue(any("multiple active subscriptions" in s.lower() for s in response.json["suggestions"]))

    @patch("services.ai_service.AIService.firebase")
    def test_generate_suggestions_no_token(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = None
        with app.app_context():
            response, status = AIService.generate_suggestions("bad_token")
            self.assertEqual(status, 401)
            self.assertIn("error", response.json)

    @patch("services.ai_service.AIService.firebase")
    def test_generate_suggestions_no_spend_fallback(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.stream.side_effect = [
            iter([]),  # no expenses
            iter([])   # no recurring
        ]

        with app.app_context():
            response, status = AIService.generate_suggestions(self.token)
            self.assertEqual(status, 200)
            self.assertEqual(response.json["suggestions"], ["You're on track! No overspending detected this month."])

    @patch("services.ai_service.AIService.firebase")
    def test_generate_suggestions_no_overspending(self, mock_firebase):
        mock_firebase.verify_user_token.return_value = self.user_id
        mock_firebase.db.collection.return_value.where.return_value.stream.side_effect = [iter([]), iter([])]

        with app.app_context():
            response, status = AIService.generate_suggestions(self.token)
            self.assertEqual(status, 200)
            self.assertIn("You're on track!", response.json["suggestions"][0])


if __name__ == "__main__":
    unittest.main()
