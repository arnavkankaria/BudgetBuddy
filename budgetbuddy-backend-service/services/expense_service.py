from flask import jsonify
from services.firebase_service import FirebaseService
from utils.expense_validations import ExpenseValidator


class ExpenseService:

    firebase = FirebaseService()

    @staticmethod
    def add_expense(data, token):
        uid = ExpenseService.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        valid, msg = ExpenseValidator.validate_expense_input(data)
        if not valid:
            return jsonify({"error": msg}), 400

        expense = {
            "user_id": uid,
            "amount": data["amount"],
            "category": data["category"],
            "date": data["date"],
            "method": data["method"],
            "notes": data.get("notes", "")
        }
        ExpenseService.firebase.db.collection("expenses").add(expense)
        return jsonify({"message": "Expense added"}), 201

    @staticmethod
    def edit_expense(expense_id, data, token):
        uid = ExpenseService.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        valid, msg = ExpenseValidator.validate_expense_input(data)
        if not valid:
            return jsonify({"error": msg}), 400

        doc_ref = ExpenseService.firebase.db.collection("expenses").document(expense_id)
        doc = doc_ref.get()
        if not doc.exists or doc.to_dict().get("user_id") != uid:
            return jsonify({"error": "Not found or unauthorized"}), 404

        doc_ref.update(data)
        return jsonify({"message": "Expense updated"}), 200

    @staticmethod
    def delete_expense(expense_id, token):
        uid = ExpenseService.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        doc_ref = ExpenseService.firebase.db.collection("expenses").document(expense_id)
        doc = doc_ref.get()
        if not doc.exists or doc.to_dict().get("user_id") != uid:
            return jsonify({"error": "Not found or unauthorized"}), 404

        doc_ref.delete()
        return jsonify({"message": "Expense deleted"}), 200

    @staticmethod
    def list_expenses(token):
        uid = ExpenseService.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        expenses = ExpenseService.firebase.db.collection("expenses").where("user_id", "==", uid).stream()
        result = [{"id": doc.id, **doc.to_dict()} for doc in expenses]
        return jsonify(result), 200