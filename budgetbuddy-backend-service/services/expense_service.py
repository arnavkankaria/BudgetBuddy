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
    def edit_expense(cls, expense_id, data, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        doc_ref = cls.firebase.db.collection("expenses").document(expense_id)
        doc = doc_ref.get()
        if not doc.exists or doc.to_dict().get("user_id") != uid:
            return jsonify({"error": "Not found or unauthorized"}), 404

        update_fields = {}
        allowed_fields = ["amount", "category", "date", "method", "notes"]

        for field in allowed_fields:
            if field in data:
                update_fields[field] = data[field]

        if not update_fields:
            return jsonify({"error": "No valid fields to update"}), 400

        doc_ref.update(update_fields)
        return jsonify({"message": "Expense updated"}), 200

    @classmethod
    def delete_expense(cls, expense_id, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        doc_ref = cls.firebase.db.collection("expenses").document(expense_id)
        doc = doc_ref.get()
        if not doc.exists or doc.to_dict().get("user_id") != uid:
            return jsonify({"error": "Not found or unauthorized"}), 404

        doc_ref.delete()
        return jsonify({"message": "Expense deleted"}), 200
    
    @classmethod
    def list_expenses(cls, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        expenses = cls.firebase.db.collection("expenses").where("user_id", "==", uid).stream()
        result = [{"id": doc.id, **doc.to_dict()} for doc in expenses]
        return jsonify(result), 200

    @classmethod
    def get_expense(cls, expense_id, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        doc_ref = cls.firebase.db.collection("expenses").document(expense_id)
        doc = doc_ref.get()
        if not doc.exists or doc.to_dict().get("user_id") != uid:
            return jsonify({"error": "Not found or unauthorized"}), 404

        expense = doc.to_dict()
        expense["id"] = doc.id
        return jsonify(expense), 200

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

    @classmethod
    def filter_by_category(cls, token, category):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        expenses = cls.firebase.db.collection("expenses") \
            .where("user_id", "==", uid) \
            .where("category", "==", category).stream()

        result = [{"id": doc.id, **doc.to_dict()} for doc in expenses]
        return jsonify(result), 200
    
    @classmethod
    def filter_by_date(cls, token, date_str):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        expenses = cls.firebase.db.collection("expenses") \
            .where("user_id", "==", uid) \
            .where("date", "==", date_str).stream()

        result = [{"id": doc.id, **doc.to_dict()} for doc in expenses]
        return jsonify(result), 200
    
    @classmethod
    def filter_by_method(cls, token, method):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        expenses = cls.firebase.db.collection("expenses") \
            .where("user_id", "==", uid) \
            .where("method", "==", method).stream()

        result = [{"id": doc.id, **doc.to_dict()} for doc in expenses]
        return jsonify(result), 200



