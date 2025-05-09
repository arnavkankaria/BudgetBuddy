import smtplib
from email.mime.text import MIMEText
import os

class EmailService:
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "your-email@gmail.com")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "your-app-password")

    @classmethod
    def send_budget_alert(cls, email, spent, limit):
        msg = MIMEText(
            f"🚨 Budget Alert!\n\nYou've spent ${spent} and exceeded your set limit of ${limit}.\n\nPlease review your expenses on BudgetBuddy."
        )
        msg["Subject"] = "Budget Exceeded"
        msg["From"] = cls.SMTP_USERNAME
        msg["To"] = email

        try:
            with smtplib.SMTP(cls.SMTP_SERVER, cls.SMTP_PORT) as server:
                server.starttls()
                server.login(cls.SMTP_USERNAME, cls.SMTP_PASSWORD)
                server.send_message(msg)
        except Exception as e:
            print(f"[Email Error] Failed to send email: {e}")
