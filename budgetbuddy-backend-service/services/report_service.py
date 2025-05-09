from flask import jsonify, send_file
from services.firebase_service import FirebaseService
from datetime import datetime, timedelta
import calendar
import io
from collections import defaultdict
import pdfkit

class ReportService:
    firebase = FirebaseService()

    @classmethod
    def generate_monthly_report(cls, token, month):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        start_date = datetime.strptime(month + "-01", "%Y-%m-%d")
        end_day = calendar.monthrange(start_date.year, start_date.month)[1]
        end_date = start_date.replace(day=end_day)

        expenses = cls.firebase.db.collection("expenses").where("user_id", "==", uid).stream()
        summary = defaultdict(float)

        for doc in expenses:
            e = doc.to_dict()
            try:
                e_date = datetime.strptime(e["date"], "%Y-%m-%d")
            except ValueError:
                continue

            if start_date <= e_date <= end_date:
                summary[e["category"]] += float(e["amount"])

        return jsonify({"month": month, "summary": dict(summary)}), 200

    @classmethod
    def generate_weekly_insights(cls, token):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        today = datetime.today()
        this_week_start = today - timedelta(days=today.weekday())
        last_week_start = this_week_start - timedelta(days=7)

        this_week = defaultdict(float)
        last_week = defaultdict(float)

        expenses = cls.firebase.db.collection("expenses").where("user_id", "==", uid).stream()

        for doc in expenses:
            e = doc.to_dict()
            date = datetime.strptime(e["date"], "%Y-%m-%d")
            amount = float(e["amount"])
            if this_week_start <= date < today:
                this_week[e["category"]] += amount
            elif last_week_start <= date < this_week_start:
                last_week[e["category"]] += amount

        insights = {}
        for category in set(this_week) | set(last_week):
            current = this_week.get(category, 0)
            previous = last_week.get(category, 0)
            if previous == 0:
                change = "New spending"
            else:
                percent = ((current - previous) / previous) * 100
                change = f"{percent:.1f}% {'more' if percent > 0 else 'less'}"
            insights[category] = change

        return jsonify({"insights": insights}), 200

    @classmethod
    def generate_pdf_report(cls, token, month):
        uid = cls.firebase.verify_user_token(token)
        if not uid:
            return jsonify({"error": "Unauthorized"}), 401

        try:
            datetime.strptime(month + "-01", "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid month format. Use YYYY-MM."}), 400

        response = cls.generate_monthly_report(token, month)
        summary = response[0].json["summary"]

        html = f"<h1>BudgetBuddy Monthly Report - {month}</h1><ul>"
        for cat, amt in summary.items():
            html += f"<li>{cat}: ${amt:.2f}</li>"
        html += "</ul>"

        pdf_bytes = pdfkit.from_string(html, False)
        return send_file(
            io.BytesIO(pdf_bytes),
            download_name=f"BudgetBuddy_Report_{month}.pdf",
            mimetype="application/pdf"
        )

