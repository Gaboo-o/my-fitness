from flask import Flask, jsonify, request
from pathlib import Path
import json

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"
DATA_DIR = BASE_DIR.parent.parent / "data"

app = Flask(
    __name__,
    static_folder=str(FRONTEND_DIR),
    static_url_path=""
)


@app.route("/")
def home():
    return app.send_static_file("index.html")


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/exercises")
def get_exercises():
    exercise_file = DATA_DIR / "exercises.json"

    with open(exercise_file, "r", encoding="utf-8") as file:
        exercises = json.load(file)

        # Get the filter parameters
        workout_type = request.args.get("type")
        location = request.args.get("location")

        # Apply type filter
        if workout_type:
            exercises = [
                ex for ex in exercises 
                if ex.get("type", "").lower() == workout_type.lower()
            ]

        # Apply Location filter
        if location:
            exercises = [
                ex for ex in exercises 
                if location.lower() in str(ex.get("location", "")).lower() or str(ex.get("location", "")).lower() == "any"
            ]

    return jsonify(exercises)



if __name__ == "__main__":
    app.run(debug=True)