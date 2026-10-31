
from flask import Blueprint, jsonify, request
from pathlib import Path
from datetime import datetime, timezone
import json
import uuid

milestone_bp = Blueprint("milestones", __name__)

DATA_FILE = Path(__file__).resolve().parents[3] / "data" / "milestones.json"


def load_milestones():
    """Load all saved milestones."""
    if not DATA_FILE.exists():
        return []

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_milestones(milestones):
    """Save milestones to the JSON file."""
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(milestones, file, indent=4)


def milestone_status(progress, target):
    """Determine whether a milestone is completed."""
    return "completed" if progress >= target else "in_progress"


@milestone_bp.route("/api/milestones", methods=["GET"])
def get_milestones():
    """Return all personal workout milestones."""
    try:
        milestones = load_milestones()
        return jsonify(milestones), 200
    except (OSError, ValueError):
        return jsonify({"error": "Unable to load milestones."}), 500


@milestone_bp.route("/api/milestones", methods=["POST"])
def create_milestone():
    """Create a new personal workout milestone."""
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Valid JSON object required."}), 400

    title = data.get("title")
    target = data.get("target")
    unit = data.get("unit", "workouts")

    if not isinstance(title, str) or not title.strip():
        return jsonify({"error": "Milestone title is required."}), 400

    if isinstance(target, bool) or not isinstance(target, int) or target <= 0:
        return jsonify({"error": "Target must be a positive whole number."}), 400

    if not isinstance(unit, str) or not unit.strip():
        return jsonify({"error": "Unit must be a non-empty string."}), 400

    milestone = {
        "id": str(uuid.uuid4()),
        "title": title.strip(),
        "target": target,
        "progress": 0,
        "unit": unit.strip(),
        "status": "in_progress",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None,
    }

    try:
        milestones = load_milestones()
        milestones.append(milestone)
        save_milestones(milestones)
    except (OSError, ValueError):
        return jsonify({"error": "Unable to save milestone."}), 500

    return jsonify(milestone), 201


@milestone_bp.route("/api/milestones/<milestone_id>", methods=["PUT"])
def update_milestone(milestone_id):
    """Update progress toward an existing milestone."""
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Valid JSON object required."}), 400

    progress = data.get("progress")

    if isinstance(progress, bool) or not isinstance(progress, int) or progress < 0:
        return jsonify({"error": "Progress must be a non-negative whole number."}), 400

    try:
        milestones = load_milestones()

        for milestone in milestones:
            if milestone["id"] == milestone_id:
                milestone["progress"] = progress
                milestone["status"] = milestone_status(
                    progress, milestone["target"]
                )

                if milestone["status"] == "completed":
                    if not milestone.get("completed_at"):
                        milestone["completed_at"] = datetime.now(
                            timezone.utc
                        ).isoformat()
                else:
                    milestone["completed_at"] = None

                save_milestones(milestones)
                return jsonify(milestone), 200

        return jsonify({"error": "Milestone not found."}), 404

    except (OSError, ValueError):
        return jsonify({"error": "Unable to update milestone."}), 500


@milestone_bp.route("/api/milestones/<milestone_id>", methods=["DELETE"])
def delete_milestone(milestone_id):
    """Delete a milestone using its unique ID."""
    try:
        milestones = load_milestones()

        updated = [
            milestone for milestone in milestones
            if milestone["id"] != milestone_id
        ]

        if len(updated) == len(milestones):
            return jsonify({"error": "Milestone not found."}), 404

        save_milestones(updated)

        return jsonify({"message": "Milestone deleted successfully."}), 200

    except (OSError, ValueError):
        return jsonify({"error": "Unable to delete milestone."}), 500
