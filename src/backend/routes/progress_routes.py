from flask import Blueprint, jsonify

from services import ProgressService


progress_bp = Blueprint("progress", __name__)


@progress_bp.route("/api/progress", methods=["GET"])
def get_progress():
    """Returns the user's weekly and monthly workout counts."""

    summary = ProgressService.get_progress_summary()

    if summary is None:
        return jsonify({
            "error": "Unable to load workout history."
        }), 500

    return jsonify(summary)