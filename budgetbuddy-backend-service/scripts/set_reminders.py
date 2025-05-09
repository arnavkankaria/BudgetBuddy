from services.firebase_service import FirebaseService
from datetime import datetime
from services.email_service import EmailService

def send_daily_reminders():
    firebase = FirebaseService()
    today = datetime.today()
    today_day = today.day

    reminders = firebase.db.collection("reminders").stream()

    for doc in reminders:
        rem = doc.to_dict()
        if rem["day"] == today_day:
            uid = rem["user_id"]
            prefs_doc = firebase.db.collection("notification_preferences").document(uid).get()
            if not prefs_doc.exists:
                continue
            prefs = prefs_doc.to_dict()

            user_doc = firebase.db.collection("users").document(uid).get()
            if not user_doc.exists:
                continue
            user = user_doc.to_dict()

            if prefs.get("email_enabled"):
                EmailService.send_custom_notification(user["email"], rem["title"], rem["message"])

            # You can similarly integrate SMS (e.g., with Twilio) if prefs["sms_enabled"]

if __name__ == "__main__":
    send_daily_reminders()
