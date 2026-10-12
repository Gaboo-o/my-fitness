from flask import Flask, jsonify, request
from pathlib import Path
import json

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"
DATA_DIR = BASE_DIR.parent.parent / "data"

# JSON Storage
class JSONStorage:
    @staticmethod
    def read_exercises():
        """Reads and returns data from exercises.json"""
        exercise_file = DATA_DIR / "exercises.json"
        try:
            with open(exercise_file, "r", encoding="utf-8") as file:
                return json.load(file)
        except (FileNotFoundError, json.JSONDecodeError):
            return None

    @staticmethod
    def read_history():
        """Reads and returns data from history.json"""
        history_file = DATA_DIR / "history.json"
        try:
            with open(history_file, "r", encoding="utf-8") as file:
                return json.load(file)
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    @staticmethod
    def write_history(data):
        """Writes data to history.json"""
        history_file = DATA_DIR / "history.json"
        with open(history_file, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=4)

# Exercise Service
class ExerciseService:
    @staticmethod
    def get_matching_exercises(workout_type, location):
        """Fetches data from storage and applies filters"""
        
        # Request data from storage
        exercises = JSONStorage.read_exercises()
        
        if exercises is None:
            return None
            
        # Apply Type filter
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
            
        return exercises

# History Service
class HistoryService:
    @staticmethod
    def get_workout_history():
        """Fetchs history data from storage"""
        return JSONStorage.read_history()

    @staticmethod
    def save_workout(workout_data):
        """Appends a new workout to storage"""
        history = JSONStorage.read_history()
        history.append(workout_data)
        JSONStorage.write_history(history)
        return workout_data

# FlaskAPI
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
    """Receives request, calls service, returns JSON"""
    
    # Get the filter parameters
    workout_type = request.args.get("type")
    location = request.args.get("location")

    # Delegate logic to the ExerciseService
    filtered_exercises = ExerciseService.get_matching_exercises(workout_type, location)
    
    if filtered_exercises is None:
        return jsonify({"error": "Exercise dataset not found or invalid."}), 404
        
    # Return final JSON to the frontend
    return jsonify(filtered_exercises)

@app.route("/api/history", methods=["GET", "POST"])
def manage_history():
    """Handles saving and retrieving workout history"""
    if request.method == "POST":
        workout_data = request.json
        saved_workout = HistoryService.save_workout(workout_data)
        return jsonify(saved_workout), 201
    
    # GET request logic matches the diagram flow
    history = HistoryService.get_workout_history()
    return jsonify(history)

if __name__ == "__main__":
    app.run(debug=True)