
from flask import Blueprint, jsonify, request

from services import WeightService


# Create Weight Tracking Blueprint
weight_bp = Blueprint("weight", __name__)


# -------------------------
# Get Weight History
# -------------------------

@weight_bp.route("/api/weight", methods=["GET"])
def get_weight_history():
    """Returns all saved weight entries."""

    history = WeightService.get_weight_history()

    if history is None:
        return jsonify({
            "error": "Unable to load weight history."
        }), 500

    return jsonify(history), 200


# -------------------------
# Save Weight Entry
# -------------------------

@weight_bp.route("/api/weight", methods=["POST"])
def save_weight():
    """Validates and saves a weight entry."""

    weight_data = request.get_json(silent=True)

    if weight_data is None:
        return jsonify({
            "error": "Request must contain valid JSON."
        }), 400

    saved_entry, error, status_code = (
        WeightService.save_weight(weight_data)
    )

    if error:
        return jsonify({
            "error": error
        }), status_code

    return jsonify({
        "message": "Weight saved successfully.",
        "entry": saved_entry
    }), status_code
