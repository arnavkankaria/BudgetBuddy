from flask import Blueprint, request
from services.budget_service import BudgetService

budget_bp = Blueprint('budget_bp', __name__)

@budget_bp.route('/budget', methods=['POST'])
def add_or_set_budget():
    token = request.headers.get("Authorization")
    data = request.get_json()
    return BudgetService.set_budget(data, token)

@budget_bp.route("/", methods=["GET"])
def get_budgets():
    token = request.headers.get("Authorization")
    return BudgetService.get_budgets(token)

@budget_bp.route("/<budget_id>", methods=["PUT"])
def edit_budget(budget_id):
    token = request.headers.get("Authorization")
    data = request.get_json()
    return BudgetService.edit_budget(budget_id, data, token)

@budget_bp.route("/<budget_id>", methods=["DELETE"])
def delete_budget(budget_id):
    token = request.headers.get("Authorization")
    return BudgetService.delete_budget(budget_id, token)

