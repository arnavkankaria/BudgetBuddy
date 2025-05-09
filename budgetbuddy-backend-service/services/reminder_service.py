from flask import jsonify
from datetime import datetime
from services.firebase_service import FirebaseService
import uuid

class ReminderService:

    firebase = FirebaseService()

    @classmethod
    def set_reminder(cls, token, data):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        required_fields = ["title", "day", "message"]
        if not all(k in data for k in required_fields):
            return jsonify({"error": "Missing fields"}), 400

        reminder = {
            "user_id": uid,
            "title": data["title"],
            "day": int(data["day"]),  # day of month
            "message": data["message"],
            "created_at": datetime.utcnow().isoformat()
        }

        cls.firebase.db.collection("reminders").document(str(uuid.uuid4())).set(reminder)
        return jsonify({"message": "Reminder created"}), 201

    @classmethod
    def set_notification_preferences(cls, token, data):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        prefs = {
            "email_enabled": data.get("email_enabled", True),
            "sms_enabled": data.get("sms_enabled", False)
        }

        cls.firebase.db.collection("notification_preferences").document(uid).set(prefs)
        return jsonify({"message": "Preferences saved"}), 200
    
    @classmethod
    def edit_reminder(cls, reminder_id, data, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        doc_ref = cls.firebase.db.collection("reminders").document(reminder_id)
        doc = doc_ref.get()
        if not doc.exists or doc.to_dict().get("user_id") != uid:
            return jsonify({"error": "Not found or unauthorized"}), 404

        allowed_fields = ["title", "day", "message", "active"]
        update_fields = {}

        for field in allowed_fields:
            if field in data:
                update_fields[field] = data[field]

        if not update_fields:
            return jsonify({"error": "No valid fields to update"}), 400

        doc_ref.update(update_fields)
        return jsonify({"message": "Reminder updated"}), 200
    
    @classmethod
    def delete_reminder(cls, reminder_id, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        doc_ref = cls.firebase.db.collection("reminders").document(reminder_id)
        doc = doc_ref.get()
        if not doc.exists or doc.to_dict().get("user_id") != uid:
            return jsonify({"error": "Not found or unauthorized"}), 404

        doc_ref.delete()
        return jsonify({"message": "Reminder deleted"}), 200
    
    @classmethod
    def list_reminders(cls, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        reminders = cls.firebase.db.collection("reminders").where("user_id", "==", uid).stream()
        result = [{"id": doc.id, **doc.to_dict()} for doc in reminders]
        return jsonify(result), 200


