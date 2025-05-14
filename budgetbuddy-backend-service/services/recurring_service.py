from flask import jsonify
from services.firebase_service import FirebaseService
from datetime import datetime, timedelta
import uuid

class RecurringService:
    firebase = FirebaseService()

    @classmethod
    def add_recurring_expense(cls, token, data):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        # Expected fields: amount, category, frequency, start_date
        required_fields = ["amount", "category", "frequency", "start_date"]
        if not all(k in data for k in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        entry = {
            "user_id": uid,
            "amount": float(data["amount"]),
            "category": data["category"],
            "frequency": data["frequency"],
            "start_date": data["start_date"],
            "end_date": data.get("end_date"),
            "notes": data.get("notes", ""),
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        }

        doc_ref = cls.firebase.db.collection("recurring").document(str(uuid.uuid4()))
        doc_ref.set(entry)
        return jsonify({"message": "Recurring expense added", "id": doc_ref.id}), 201

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

        allowed_fields = ["amount", "category", "frequency", "start_date", "end_date", "notes"]
        update_fields = {}

        for field in allowed_fields:
            if field in data:
                if field == "amount":
                    update_fields[field] = float(data[field])
                else:
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

    @classmethod
    def get_upcoming_payments(cls, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        today = datetime.now().date()
        next_month = today + timedelta(days=30)
        
        rec = cls.firebase.db.collection("recurring").where("user_id", "==", uid).where("status", "==", "active").stream()
        upcoming = []
        
        for doc in rec:
            data = doc.to_dict()
            start_date = datetime.strptime(data["start_date"], "%Y-%m-%d").date()
            if start_date <= next_month:
                upcoming.append({
                    "id": doc.id,
                    "amount": data["amount"],
                    "category": data["category"],
                    "frequency": data["frequency"],
                    "start_date": data["start_date"],
                    "notes": data.get("notes", "")
                })
        
        return jsonify(upcoming), 200

    @classmethod
    def update_status(cls, recurring_id, data, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        if "status" not in data or data["status"] not in ["active", "paused", "cancelled"]:
            return jsonify({"error": "Invalid status"}), 400

        doc_ref = cls.firebase.db.collection("recurring").document(recurring_id)
        doc = doc_ref.get()
        if not doc.exists or doc.to_dict().get("user_id") != uid:
            return jsonify({"error": "Not found or unauthorized"}), 404

        doc_ref.update({"status": data["status"]})
        return jsonify({"message": "Status updated successfully"}), 200


