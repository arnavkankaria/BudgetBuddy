from flask import Blueprint, request
from services.expense_service import ExpenseService

expense_bp = Blueprint("expenses", __name__)

@expense_bp.route("/", methods=["POST"])
def add_expense():
    token = request.headers.get("Authorization")
    data = request.get_json()
    return ExpenseService.add_expense(data, token)

@expense_bp.route("/<expense_id>", methods=["PUT"])
def edit_expense(expense_id):
    token = request.headers.get("Authorization")
    data = request.get_json()
    return ExpenseService.edit_expense(expense_id, data, token)

@expense_bp.route("/<expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    token = request.headers.get("Authorization")
    return ExpenseService.delete_expense(expense_id, token)

@expense_bp.route("/", methods=["GET"])
def list_expenses():
    token = request.headers.get("Authorization")
    return ExpenseService.list_expenses(token)
