from flask import jsonify, send_file
from services.firebase_service import FirebaseService
from werkzeug.utils import secure_filename
import csv, io, json, uuid
from datetime import datetime

class DataService:

    firebase = FirebaseService()

    @classmethod
    def export_expenses(cls, token, filetype):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        expenses = cls.firebase.db.collection("expenses").where("user_id", "==", uid).stream()
        expense_list = [doc.to_dict() for doc in expenses]

        if filetype == "csv":
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=["amount", "category", "date", "method", "notes"])
            writer.writeheader()
            for exp in expense_list:
                writer.writerow(exp)
            output.seek(0)
            return send_file(io.BytesIO(output.getvalue().encode()), download_name="expenses.csv", mimetype="text/csv")

        else:  # default: json
            return jsonify(expense_list), 200

    @classmethod
    def import_expenses(cls, token, file):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        if not file:
            return jsonify({"error": "No file uploaded"}), 400

        filename = secure_filename(file.filename)
        content = file.read()

        try:
            if filename.endswith(".json"):
                try:
                    data = json.loads(content)
                except json.JSONDecodeError:
                    return jsonify({"error": "Invalid JSON format"}), 400
            elif filename.endswith(".csv"):
                content_str = content.decode()
                reader = csv.DictReader(io.StringIO(content_str))
                data = list(reader)
            else:
                return jsonify({"error": "Unsupported file type"}), 400

            for record in data:
                record["user_id"] = uid
                record["amount"] = float(record["amount"])
                record["date"] = record.get("date", datetime.today().strftime("%Y-%m-%d"))
                cls.firebase.db.collection("expenses").document(str(uuid.uuid4())).set(record)

            return jsonify({"message": f"{len(data)} expenses imported"}), 201

        except Exception as e:
            return jsonify({"error": str(e)}), 500
