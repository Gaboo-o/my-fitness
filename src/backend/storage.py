import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR.parent.parent / "data"


class JSONStorage:
    @staticmethod
    def read_exercises():
        try:
            with open(DATA_DIR / "exercises.json", "r", encoding="utf-8") as file:
                return json.load(file)
        except (FileNotFoundError, json.JSONDecodeError, OSError):
            return None

    @staticmethod
    def read_profile():
        try:
            with open(DATA_DIR / "profile.json", "r", encoding="utf-8") as file:
                return json.load(file)
        except FileNotFoundError:
            return {}
        except (json.JSONDecodeError, OSError):
            return None

    @staticmethod
    def write_profile(profile):
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        try:
            with open(DATA_DIR / "profile.json", "w", encoding="utf-8") as file:
                json.dump(profile, file, indent=4)
            return True
        except OSError:
            return False

    @staticmethod
    def read_workout_history():
        """Both the history page and dashboard use data/history.json."""
        try:
            with open(DATA_DIR / "history.json", "r", encoding="utf-8") as file:
                history = json.load(file)
            return history if isinstance(history, list) else None
        except FileNotFoundError:
            return []
        except (json.JSONDecodeError, OSError):
            return None

    @staticmethod
    def append_workout(workout):
        history = JSONStorage.read_workout_history()
        if history is None:
            return False
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        history.append(workout)
        try:
            with open(DATA_DIR / "history.json", "w", encoding="utf-8") as file:
                json.dump(history, file, indent=4)
            return True
        except OSError:
            return False
