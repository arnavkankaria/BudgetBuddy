from flask import jsonify
from datetime import datetime, timedelta
from collections import defaultdict
from services.firebase_service import FirebaseService

#kepp last for implementation
class AIService:

    firebase = FirebaseService()

    @classmethod
    def generate_suggestions(cls, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        today = datetime.today()
        current_month = today.strftime("%Y-%m")
        past_expenses = cls.firebase.db.collection("expenses").where("user_id", "==", uid).stream()

        # Aggregate expenses
        monthly_totals = defaultdict(lambda: defaultdict(float))  # month -> category -> total
        service_keywords = ["spotify", "netflix", "prime", "hotstar"]

        for doc in past_expenses:
            e = doc.to_dict()
            e_date = datetime.strptime(e["date"], "%Y-%m-%d")
            month_str = e_date.strftime("%Y-%m")
            monthly_totals[month_str][e["category"]] += float(e["amount"])

        # 1. High category spend check
        suggestions = []
        for category in monthly_totals[current_month]:
            current_spend = monthly_totals[current_month][category]
            last_months = [k for k in monthly_totals if k != current_month]
            if not last_months:
                continue

            avg = sum(monthly_totals[m].get(category, 0) for m in last_months) / len(last_months)
            if avg > 0 and current_spend > avg * 1.2:
                percent = ((current_spend - avg) / avg) * 100
                suggestions.append(
                    f"Your **{category}** spending is {percent:.0f}% higher this month than your 3-month average."
                )

        # 2. Subscriptions check
        recurring = cls.firebase.db.collection("recurring").where("user_id", "==", uid).stream()
        subscription_count = 0
        for r in recurring:
            title = r.to_dict().get("notes", "").lower()
            if any(keyword in title for keyword in service_keywords):
                subscription_count += 1

        if subscription_count >= 3:
            suggestions.append("You have multiple active subscriptions. Consider cancelling unused ones to save money.")

        if not suggestions:
            suggestions.append("You're on track! No overspending detected this month.")

        return jsonify({"suggestions": suggestions}), 200

    @classmethod
    def process_recurring_transactions(cls, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        # Get all recurring transactions
        recurring_transactions = cls.firebase.db.collection("users").document(uid).collection("transactions").where("isRecurring", "==", True).stream()
        
        today = datetime.today()
        processed_transactions = []

        for doc in recurring_transactions:
            transaction = doc.to_dict()
            next_payment_date = transaction.get("nextPaymentDate")
            
            if not next_payment_date:
                continue

            # Convert Firestore timestamp to datetime
            if hasattr(next_payment_date, 'toDate'):
                next_payment_date = next_payment_date.toDate()
            
            # Check if payment is due
            if next_payment_date <= today:
                # Create new transaction
                new_transaction = {
                    "amount": transaction["amount"],
                    "category": transaction["category"],
                    "date": today,
                    "description": transaction["description"],
                    "type": "expense",
                    "isRecurring": True,
                    "recurrence": transaction["recurrence"]
                }

                # Calculate next payment date
                if transaction["recurrence"] == "weekly":
                    next_payment = today + timedelta(days=7)
                elif transaction["recurrence"] == "monthly":
                    next_payment = today + timedelta(days=30)
                else:  # yearly
                    next_payment = today + timedelta(days=365)

                new_transaction["nextPaymentDate"] = next_payment

                # Add new transaction
                cls.firebase.db.collection("users").document(uid).collection("transactions").add(new_transaction)
                processed_transactions.append(transaction["description"])

        return jsonify({
            "message": "Recurring transactions processed",
            "processed": processed_transactions
        })
