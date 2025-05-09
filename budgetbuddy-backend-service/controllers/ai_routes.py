from flask import Blueprint, request
from services.ai_service import AIService

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/suggestions", methods=["GET"])
def get_suggestions():
    token = request.headers.get("Authorization")
    return AIService.generate_suggestions(token)
