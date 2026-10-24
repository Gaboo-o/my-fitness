from flask import Blueprint, jsonify, request
from services import HistoryService

history_bp = Blueprint("history", __name__)

@history_bp.route("/api/history", methods=["GET"])
def get_history():
    """Returns the workout history."""
    history = HistoryService.get_workout_history()
    return jsonify(history), 200

@history_bp.route("/api/history", methods=["POST"])
def save_history():
    """Validates and saves a completed workout."""
    workout_data = request.get_json(silent=True)

    if workout_data is None:
        return jsonify({"error": "Request body must contain valid JSON."}), 400

    saved_workout, error = HistoryService.save_workout(workout_data)

    if error:
        return jsonify({"error": error}), 500

    return jsonify({
        "message": "Workout saved successfully.",
        "workout": saved_workout
    }), 201