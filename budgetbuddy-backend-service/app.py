# app.py
from flask import Flask, request, jsonify
from services.firebase_service import db, verify_user_token

app = Flask(__name__)

@app.route("/add_expense", methods=["POST"])
def add_expense():
    token = request.headers.get("Authorization")
    user_id = verify_user_token(token)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    expense = {
        "user_id": user_id,
        "amount": data.get("amount"),
        "category": data.get("category"),
        "date": data.get("date"),
        "method": data.get("method"),
        "notes": data.get("notes", "")
    }
    db.collection("expenses").add(expense)
    return jsonify({"status": "Expense added"}), 200

if __name__ == "__main__":
    app.run(debug=True)
