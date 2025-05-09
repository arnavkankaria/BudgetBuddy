from flask import Blueprint, request
from services.data_service import DataService

data_bp = Blueprint("data", __name__)

@data_bp.route("/export", methods=["GET"])
def export_data():
    token = request.headers.get("Authorization")
    filetype = request.args.get("type", "csv")  # json or csv
    return DataService.export_expenses(token, filetype)

@data_bp.route("/import", methods=["POST"])
def import_data():
    token = request.headers.get("Authorization")
    file = request.files.get("file")
    return DataService.import_expenses(token, file)
