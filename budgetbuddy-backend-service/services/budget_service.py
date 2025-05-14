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
        if period not in ["daily", "weekly", "monthly", "yearly"]:
            return jsonify({"error": "Invalid period"}), 400

        budget = {
            "user_id": uid,
            "amount": data["amount"],
            "period": period,
            "category": data.get("category", "overall"),
            "start_date": data.get("start_date", str(datetime.now().date())),
            "end_date": None  # Removed custom period logic since we now use standard periods
        }

        cls.firebase.db.collection("budgets").add(budget)
        return jsonify({"message": "Budget set"}), 201
    
    @classmethod
    def get_budgets(cls, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        budgets = cls.firebase.db.collection("budgets").where("user_id", "==", uid).stream()
        result = [{"id": doc.id, **doc.to_dict()} for doc in budgets]
        return jsonify(result), 200
    
    @classmethod
    def edit_budget(cls, budget_id, data, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        doc_ref = cls.firebase.db.collection("budgets").document(budget_id)
        doc = doc_ref.get()
        if not doc.exists or doc.to_dict().get("user_id") != uid:
            return jsonify({"error": "Not found or unauthorized"}), 404

        update_fields = {}
        allowed_fields = ["amount", "category", "period", "start_date", "end_date"]

        for field in allowed_fields:
            if field in data:
                update_fields[field] = data[field]

        if not update_fields:
            return jsonify({"error": "No valid fields to update"}), 400

        doc_ref.update(update_fields)
        return jsonify({"message": "Budget updated"}), 200
    
    @classmethod
    def delete_budget(cls, budget_id, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        doc_ref = cls.firebase.db.collection("budgets").document(budget_id)
        doc = doc_ref.get()
        if not doc.exists or doc.to_dict().get("user_id") != uid:
            return jsonify({"error": "Not found or unauthorized"}), 404

        doc_ref.delete()
        return jsonify({"message": "Budget deleted"}), 200



