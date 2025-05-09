from flask import Blueprint, request
from services.budget_service import BudgetService

budget_bp = Blueprint('budget_bp', __name__)

@budget_bp.route('/budget', methods=['POST'])
def add_or_set_budget():
    token = request.headers.get("Authorization")
    data = request.get_json()
    return BudgetService.set_budget(data, token)
