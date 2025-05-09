from services.firebase_service import FirebaseService
from datetime import datetime
import uuid

def run_recurring_job():
    firebase = FirebaseService()
    today = datetime.today()
    current_day = today.day
    today_str = today.strftime("%Y-%m-%d")

    recs = firebase.db.collection("recurring").stream()

    for rec in recs:
        data = rec.to_dict()
        if data["day"] == current_day:
            expense = {
                "user_id": data["user_id"],
                "amount": data["amount"],
                "category": data["category"],
                "date": today_str,
                "method": data["method"],
                "notes": f"[Recurring] {data.get('notes', '')}"
            }
            firebase.db.collection("expenses").document(str(uuid.uuid4())).set(expense)
            print(f"✅ Added recurring expense for user: {data['user_id']}")

if __name__ == "__main__":
    run_recurring_job()
