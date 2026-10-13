from pathlib import Path
import json

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR.parent.parent / "data"


class JSONStorage:
    @staticmethod
    def read_exercises():
        """Reads and returns data from exercises.json."""
        exercise_file = DATA_DIR / "exercises.json"

        try:
            with open(exercise_file, "r", encoding="utf-8") as file:
                return json.load(file)
        except (FileNotFoundError, json.JSONDecodeError):
            return None

    @staticmethod
    def read_profile():
        """Reads and returns data from profile.json."""
        profile_file = DATA_DIR / "profile.json"

        try:
            with open(profile_file, "r", encoding="utf-8") as file:
                return json.load(file)
        except FileNotFoundError:
            return {}
        except json.JSONDecodeError:
            return None

    @staticmethod
    def write_profile(profile):
        """Writes profile data to profile.json."""
        profile_file = DATA_DIR / "profile.json"
        DATA_DIR.mkdir(parents=True, exist_ok=True)

        try:
            with open(profile_file, "w", encoding="utf-8") as file:
                json.dump(profile, file, indent=4)
            return True
        except OSError:
            return False
