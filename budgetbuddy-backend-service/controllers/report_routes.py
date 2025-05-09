from flask import Blueprint, request
from services.report_service import ReportService

report_bp = Blueprint("report", __name__)

@report_bp.route("/monthly", methods=["GET"])
def monthly_report():
    token = request.headers.get("Authorization")
    month = request.args.get("month")  # Format: YYYY-MM
    return ReportService.generate_monthly_report(token, month)

@report_bp.route("/insights", methods=["GET"])
def insights_report():
    token = request.headers.get("Authorization")
    return ReportService.generate_weekly_insights(token)

@report_bp.route("/monthly/pdf", methods=["GET"])
def monthly_pdf():
    token = request.headers.get("Authorization")
    month = request.args.get("month")
    return ReportService.generate_pdf_report(token, month)
