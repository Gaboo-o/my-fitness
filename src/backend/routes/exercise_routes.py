from flask import Blueprint, jsonify, request

from services import ExerciseService

exercise_bp = Blueprint("exercises", __name__)


@exercise_bp.route("/api/exercises", methods=["GET"])
def get_exercises():
    """Receives filter parameters and returns matching exercises."""

    # Get the filter parameters
    workout_type = request.args.get("type")
    location = request.args.get("location")

    # Delegate logic to the ExerciseService
    filtered_exercises = ExerciseService.get_matching_exercises(
        workout_type,
        location,
    )

    if filtered_exercises is None:
        return jsonify({"error": "Exercise dataset not found or invalid."}), 404

    # Return final JSON to the frontend
    return jsonify(filtered_exercises), 200
