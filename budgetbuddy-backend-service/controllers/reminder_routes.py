from flask import Blueprint, request
from services.reminder_service import ReminderService

reminder_bp = Blueprint("reminder", __name__)

@reminder_bp.route("/", methods=["POST"])
def set_reminder():
    token = request.headers.get("Authorization")
    data = request.get_json()
    return ReminderService.set_reminder(token, data)

@reminder_bp.route("/preferences", methods=["POST"])
def set_preferences():
    token = request.headers.get("Authorization")
    data = request.get_json()
    return ReminderService.set_notification_preferences(token, data)

@reminder_bp.route("/<reminder_id>", methods=["PUT"])
def edit_reminder(reminder_id):
    token = request.headers.get("Authorization")
    data = request.get_json()
    return ReminderService.edit_reminder(reminder_id, data, token)

@reminder_bp.route("/<reminder_id>", methods=["DELETE"])
def delete_reminder(reminder_id):
    token = request.headers.get("Authorization")
    return ReminderService.delete_reminder(reminder_id, token)

@reminder_bp.route("/", methods=["GET"])
def list_reminders():
    token = request.headers.get("Authorization")
    return ReminderService.list_reminders(token)

