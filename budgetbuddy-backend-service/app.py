from flask import Flask, request, jsonify
from controllers.auth_routes import auth_bp
from controllers.expense_routes import expense_bp
from controllers.budget_routes import budget_bp
from controllers.report_routes import report_bp
from controllers.recurring_routes import recurring_bp
from controllers.reminder_routes import reminder_bp
from controllers.data_routes import data_bp
from services.ai_service import AIService
from services.firebase_service import FirebaseService

app = Flask(__name__)
firebase_service = FirebaseService()

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(expense_bp, url_prefix="/expenses")
app.register_blueprint(budget_bp, url_prefix="/budget")  
app.register_blueprint(report_bp, url_prefix="/reports") 
app.register_blueprint(recurring_bp, url_prefix="/recurring")
app.register_blueprint(reminder_bp, url_prefix="/reminders")
app.register_blueprint(data_bp, url_prefix="/data")

@app.route('/auth/verify', methods=['GET'])
def verify_token():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "No token provided"}), 401
    
    uid = firebase_service.verify_user_token(token)
    if not uid:
        return jsonify({"error": "Invalid token"}), 401
    
    return jsonify({"uid": uid}), 200

@app.route('/transactions/recurring/process', methods=['POST'])
def process_recurring_transactions():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "No token provided"}), 401
    
    return AIService.process_recurring_transactions(token)

if __name__ == "__main__":
    app.run(debug=True)
