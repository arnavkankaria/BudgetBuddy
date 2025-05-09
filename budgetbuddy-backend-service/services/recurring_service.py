from flask import jsonify
from services.firebase_service import FirebaseService
from datetime import datetime
import uuid

class RecurringService:

    firebase = FirebaseService()

    @classmethod
    def add_recurring_expense(cls, token, data):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        # Expected fields: amount, category, method, day (1-28), notes
        required_fields = ["amount", "category", "method", "day"]
        if not all(k in data for k in required_fields):
            return jsonify({"error": "Missing fields"}), 400

        entry = {
            "user_id": uid,
            "amount": data["amount"],
            "category": data["category"],
            "method": data["method"],
            "day": int(data["day"]),  # recurring day of month
            "notes": data.get("notes", ""),
            "created_at": datetime.utcnow().isoformat()
        }

        cls.firebase.db.collection("recurring").document(str(uuid.uuid4())).set(entry)
        return jsonify({"message": "Recurring expense added"}), 201

    @classmethod
    def list_recurring_expenses(cls, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        rec = cls.firebase.db.collection("recurring").where("user_id", "==", uid).stream()
        result = [{"id": doc.id, **doc.to_dict()} for doc in rec]
        return jsonify(result), 200
    
    @classmethod
    def edit_recurring_expense(cls, recurring_id, data, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        doc_ref = cls.firebase.db.collection("recurring").document(recurring_id)
        doc = doc_ref.get()
        if not doc.exists or doc.to_dict().get("user_id") != uid:
            return jsonify({"error": "Not found or unauthorized"}), 404

        allowed_fields = ["amount", "category", "method", "day", "notes"]
        update_fields = {}

        for field in allowed_fields:
            if field in data:
                update_fields[field] = data[field]

        if not update_fields:
            return jsonify({"error": "No valid fields to update"}), 400

        doc_ref.update(update_fields)
        return jsonify({"message": "Recurring expense updated"}), 200
    
    @classmethod
    def delete_recurring_expense(cls, recurring_id, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        doc_ref = cls.firebase.db.collection("recurring").document(recurring_id)
        doc = doc_ref.get()
        if not doc.exists or doc.to_dict().get("user_id") != uid:
            return jsonify({"error": "Not found or unauthorized"}), 404

        doc_ref.delete()
        return jsonify({"message": "Recurring expense deleted"}), 200


