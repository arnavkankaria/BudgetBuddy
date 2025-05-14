from flask import Blueprint, request, jsonify
from services.auth_service import AuthService
from services.google_auth_service import GoogleAuthService

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    return AuthService.register_user(data)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    return AuthService.login_user(data)

@auth_bp.route("/delete", methods=["DELETE"])
def delete_account():
    token = request.headers.get("Authorization")
    return AuthService.delete_user(token)

@auth_bp.route("/google", methods=["POST"])
def google_auth():
    data = request.get_json()
    if not data or 'token' not in data:
        return jsonify({"error": "Missing Google token"}), 400
    
    return GoogleAuthService.verify_google_token(data['token'])
