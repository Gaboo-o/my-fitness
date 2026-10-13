from flask import Blueprint, jsonify, request

from services import ProfileService

profile_bp = Blueprint("profile", __name__)


@profile_bp.route("/api/profile", methods=["GET"])
def get_profile():
    """Returns the saved personal profile."""
    profile = ProfileService.get_profile()

    if profile is None:
        return jsonify({"error": "Profile data is invalid."}), 500

    return jsonify(profile), 200


@profile_bp.route("/api/profile", methods=["PUT"])
def update_profile():
    """Validates and saves personal profile data."""
    profile_data = request.get_json(silent=True)

    if profile_data is None:
        return jsonify({"error": "Request body must contain valid JSON."}), 400

    saved_profile, error = ProfileService.validate_and_save_profile(profile_data)

    if error:
        status_code = 500 if error == "Unable to save profile." else 400
        return jsonify({"error": error}), status_code

    return jsonify({
        "message": "Profile saved successfully.",
        "profile": saved_profile,
    }), 200
