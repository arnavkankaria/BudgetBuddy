import unittest
from unittest.mock import patch, MagicMock
from services.email_service import EmailService

class TestEmailService(unittest.TestCase):

    @patch("services.email_service.smtplib.SMTP")
    def test_send_budget_alert_success(self, mock_smtp):
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server
        EmailService.send_budget_alert("user@example.com", 1200, 1000)
        mock_server.send_message.assert_called_once()

    @patch("services.email_service.smtplib.SMTP")
    def test_send_custom_notification_success(self, mock_smtp):
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server
        EmailService.send_custom_notification("user@example.com", "Reminder", "This is a reminder.")
        mock_server.send_message.assert_called_once()

    @patch("builtins.print")
    @patch("services.email_service.smtplib.SMTP", side_effect=Exception("SMTP error"))
    def test_send_budget_alert_failure(self, mock_smtp, mock_print):
        try:
            EmailService.send_budget_alert("user@example.com", 1200, 1000)
        except Exception:
            self.fail("send_budget_alert() raised an exception unexpectedly!")

    @patch("builtins.print")
    @patch("services.email_service.smtplib.SMTP", side_effect=Exception("SMTP error"))
    def test_send_custom_notification_failure(self, mock_smtp, mock_print):
        try:
            EmailService.send_custom_notification("user@example.com", "Subject", "Body")
        except Exception:
            self.fail("send_custom_notification() raised an exception unexpectedly!")

if __name__ == "__main__":
    unittest.main()
