from flask import Flask
from controllers.auth_routes import auth_bp
from controllers.expense_routes import expense_bp
from controllers.budget_routes import budget_bp
from controllers.report_routes import report_bp
# Add others as needed (budget_bp, report_bp, etc.)

app = Flask(__name__)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(expense_bp, url_prefix="/expenses")
app.register_blueprint(budget_bp, url_prefix="/budget")  
app.register_blueprint(report_bp, url_prefix="/reports") 

if __name__ == "__main__":
    app.run(debug=True)
