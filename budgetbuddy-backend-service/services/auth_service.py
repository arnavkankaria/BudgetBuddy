from firebase_admin import auth
from flask import jsonify
from services.firebase_service import FirebaseService
from utils.auth_validations import AuthValidator

class AuthService:

    firebase = FirebaseService()

    @staticmethod
    def register_user(data):
        valid, msg = AuthValidator.validate_registration_input(data)
        if not valid:
            return jsonify({"error": msg}), 400

        try:
            user_record = auth.create_user(
                email=data["email"],
                password=data["password"],
                display_name=data.get("display_name", "")
            )
            user_doc = {
                "uid": user_record.uid,
                "email": user_record.email,
                "display_name": user_record.display_name
            }
            AuthService.firebase.db.collection("users").document(user_record.uid).set(user_doc)
            return jsonify({"message": "User registered", "uid": user_record.uid}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @staticmethod
    def login_user(data):
        token = data.get("token")
        if not token:
            return jsonify({"error": "Missing token"}), 400

        uid = AuthService.firebase.verify_user_token(token)
        if uid:
            return jsonify({"message": "Token is valid", "uid": uid}), 200
        return jsonify({"error": "Invalid token"}), 401

    @staticmethod
    def delete_user(token):
        uid = AuthService.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401
        try:
            auth.delete_user(uid)
            AuthService.firebase.db.collection("users").document(uid).delete()
            return jsonify({"message": "User account deleted"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400