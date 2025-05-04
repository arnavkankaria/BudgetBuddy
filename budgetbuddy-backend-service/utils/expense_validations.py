class ExpenseValidator:

    @staticmethod
    def validate_expense_input(data):
        required_fields = ["amount", "category", "date", "method"]
        for field in required_fields:
            if field not in data:
                return False, f"Missing required field: {field}"

        if not isinstance(data["amount"], (int, float)) or data["amount"] < 0:
            return False, "Amount must be a positive number"

        if not isinstance(data["category"], str) or not data["category"].strip():
            return False, "Category must be a non-empty string"

        if not isinstance(data["date"], str):
            return False, "Date must be a valid string format (e.g., YYYY-MM-DD)"

        if not isinstance(data["method"], str) or not data["method"].strip():
            return False, "Payment method must be a non-empty string"

        return True, "Valid"
