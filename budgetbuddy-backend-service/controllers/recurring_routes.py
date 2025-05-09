from flask import Blueprint, request
from services.recurring_service import RecurringService

recurring_bp = Blueprint("recurring", __name__)

@recurring_bp.route("/", methods=["POST"])
def add_recurring():
    token = request.headers.get("Authorization")
    data = request.get_json()
    return RecurringService.add_recurring_expense(token, data)

@recurring_bp.route("/", methods=["GET"])
def list_recurring():
    token = request.headers.get("Authorization")
    return RecurringService.list_recurring_expenses(token)

@recurring_bp.route("/<recurring_id>", methods=["PUT"])
def edit_recurring(recurring_id):
    token = request.headers.get("Authorization")
    data = request.get_json()
    return RecurringService.edit_recurring_expense(recurring_id, data, token)

@recurring_bp.route("/<recurring_id>", methods=["DELETE"])
def delete_recurring(recurring_id):
    token = request.headers.get("Authorization")
    return RecurringService.delete_recurring_expense(recurring_id, token)
