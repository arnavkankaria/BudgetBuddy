from flask import Blueprint, request, jsonify
from services.auth_service import AuthService

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
