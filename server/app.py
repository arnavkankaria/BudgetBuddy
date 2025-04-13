from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase app
cred = credentials.Certificate("firebase_config.json")  # your downloaded service account key
firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)

@app.route('/hello', methods=['GET'])
def hello():
    return jsonify("hello")


# Add an expense
@app.route('/expenses', methods=['POST'])
def add_expense():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400

        expense_data = {
            'amount': data.get('amount'),
            'category': data.get('category'),
            'note': data.get('note'),
            'date': firestore.SERVER_TIMESTAMP
        }

        db.collection('users').document(user_id).collection('expenses').add(expense_data)
        return jsonify({'message': 'Expense added'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get all expenses for a user
@app.route('/expenses/<user_id>', methods=['GET'])
def get_expenses(user_id):
    try:
        expenses_ref = db.collection('users').document(user_id).collection('expenses')
        docs = expenses_ref.stream()

        expenses = []
        for doc in docs:
            expense = doc.to_dict()
            expense['id'] = doc.id
            expenses.append(expense)

        return jsonify(expenses), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
