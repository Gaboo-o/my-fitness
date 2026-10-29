
from pathlib import Path
import json
import os
import tempfile


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR.parent.parent / "data"


class JSONStorage:
    @staticmethod
    def read_exercises():
        """Reads exercise data from exercises.json."""
        exercise_file = DATA_DIR / "exercises.json"

        try:
            with open(exercise_file, "r", encoding="utf-8") as file:
                return json.load(file)

        except (FileNotFoundError, json.JSONDecodeError):
            return None

    @staticmethod
    def read_profile():
        """Reads profile information from profile.json."""
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

    # -------------------------
    # Weight Tracking Storage
    # -------------------------

    @staticmethod
    def read_weight_history():
        """Reads weight entries from weight_history.json."""
        weight_file = DATA_DIR / "weight_history.json"

        try:
            with open(weight_file, "r", encoding="utf-8") as file:
                history = json.load(file)

            if not isinstance(history, list):
                return None

            return history

        except FileNotFoundError:
            return []

        except (json.JSONDecodeError, OSError):
            return None

    @staticmethod
    def write_weight_history(history):
        """Safely writes weight entries to JSON storage."""
        DATA_DIR.mkdir(parents=True, exist_ok=True)

        weight_file = DATA_DIR / "weight_history.json"
        temporary_path = None

        try:
            with tempfile.NamedTemporaryFile(
                mode="w",
                encoding="utf-8",
                dir=DATA_DIR,
                prefix=".weight_",
                suffix=".tmp",
                delete=False,
            ) as temporary_file:
                temporary_path = temporary_file.name
                json.dump(history, temporary_file, indent=4)

            os.replace(temporary_path, weight_file)

            return True

        except (OSError, TypeError, ValueError):
            if temporary_path is not None:
                try:
                    os.unlink(temporary_path)
                except OSError:
                    pass

            return False
