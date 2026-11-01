from flask import Blueprint, jsonify, request
from services import HistoryService

history_bp = Blueprint("history", __name__)

@history_bp.route("/api/history", methods=["GET"])
def get_history():
    history = HistoryService.get_workout_history()
    if history is None:
        return jsonify({"error": "Unable to load workout history."}), 500
    return jsonify(history), 200

@history_bp.route("/api/history", methods=["POST"])
def save_history():
    workout_data = request.get_json(silent=True)
    if workout_data is None:
        return jsonify({"error": "Request body must contain valid JSON."}), 400
    saved_workout, error = HistoryService.save_workout(workout_data)
    if error:
        status = 500 if error == "Unable to save workout history." else 400
        return jsonify({"error": error}), status
    return jsonify({"message": "Workout saved successfully.", "workout": saved_workout}), 201
