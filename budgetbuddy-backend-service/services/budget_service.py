from flask import jsonify
from datetime import datetime
from services.firebase_service import FirebaseService

class BudgetService:

    firebase = FirebaseService()

    @classmethod
    def set_budget(cls, data, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        # Period validation
        period = data.get("period")
        if period not in ["weekly", "monthly", "custom"]:
            return jsonify({"error": "Invalid period"}), 400

        budget = {
            "user_id": uid,
            "amount": data["amount"],
            "period": period,
            "category": data.get("category", "overall"),
            "start_date": data.get("start_date", str(datetime.now().date())),
            "end_date": data.get("end_date") if period == "custom" else None
        }

        cls.firebase.db.collection("budgets").add(budget)
        return jsonify({"message": "Budget set"}), 201
