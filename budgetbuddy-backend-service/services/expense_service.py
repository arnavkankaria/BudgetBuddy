from flask import jsonify
from services.firebase_service import FirebaseService
from services.email_service import EmailService
from utils.expense_validations import ExpenseValidator
from utils.expense_classifier import ExpenseClassifier

class ExpenseService:

    firebase = FirebaseService()

    @classmethod
    def add_expense(cls, data, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        valid, msg = ExpenseValidator.validate_expense_input(data)
        if not valid:
            return jsonify({"error": msg}), 400

        description = data.get("notes", "")
        category = ExpenseClassifier.classify(description)

        expense = {
            "user_id": uid,
            "amount": data["amount"],
            "category": category,
            "date": data["date"],
            "method": data["method"],
            "notes": description
        }

        cls.firebase.db.collection("expenses").add(expense)
        cls._check_and_notify(uid, category)

        return jsonify({"message": "Expense added"}), 201

    @classmethod
    def _check_and_notify(cls, uid, category):
        budgets = cls.firebase.db.collection("budgets").where("user_id", "==", uid).stream()
        total_spent = 0

        for doc in cls.firebase.db.collection("expenses").where("user_id", "==", uid).stream():
            exp = doc.to_dict()
            if exp.get("category") == category:
                total_spent += float(exp["amount"])

        for doc in budgets:
            budget = doc.to_dict()
            if budget["category"] == category or budget["category"] == "overall":
                if total_spent > float(budget["amount"]):
                    user_doc = cls.firebase.db.collection("users").document(uid).get().to_dict()
                    EmailService.send_budget_alert(user_doc["email"], total_spent, budget["amount"])
                    break
