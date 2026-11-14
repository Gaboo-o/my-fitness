"""JSON persistence for the local, single-user myFitness prototype."""
import json
import os
import tempfile
from pathlib import Path
from threading import Lock

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR.parent.parent / "data"

# Protect read-modify-write operations between requests in the same process.
# For a multi-process or multi-user deployment use a transactional database.
_HISTORY_LOCK = Lock()


def atomic_write_json(path, data):
    """Replace a JSON file only after the new content is fully written."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as output:
            json.dump(data, output, indent=4, allow_nan=False)
            output.write("\n")
            output.flush()
            os.fsync(output.fileno())
        os.replace(temporary_name, path)
    finally:
        if os.path.exists(temporary_name):
            os.unlink(temporary_name)


class JSONStorage:
    @staticmethod
    def read_exercises():
        try:
            with open(DATA_DIR / "exercises.json", encoding="utf-8") as source:
                exercises = json.load(source)
            return exercises if isinstance(exercises, list) and all(
                isinstance(exercise, dict) for exercise in exercises
            ) else None
        except (FileNotFoundError, json.JSONDecodeError, OSError):
            return None

    @staticmethod
    def read_profile():
        try:
            with open(DATA_DIR / "profile.json", encoding="utf-8") as source:
                profile = json.load(source)
            return profile if isinstance(profile, dict) else None
        except FileNotFoundError:
            return {}
        except (json.JSONDecodeError, OSError):
            return None

    @staticmethod
    def write_profile(profile):
        try:
            atomic_write_json(DATA_DIR / "profile.json", profile)
            return True
        except (OSError, TypeError, ValueError):
            return False

    @staticmethod
    def read_workout_history():
        """Both History and Progress use data/history.json as the source of truth."""
        try:
            with open(DATA_DIR / "history.json", encoding="utf-8") as source:
                history = json.load(source)
            return history if isinstance(history, list) and all(
                isinstance(record, dict) for record in history
            ) else None
        except FileNotFoundError:
            return []
        except (json.JSONDecodeError, OSError):
            return None

    @staticmethod
    def append_workout(workout):
        with _HISTORY_LOCK:
            history = JSONStorage.read_workout_history()
            if history is None:
                return False
            history.append(workout)
            try:
                atomic_write_json(DATA_DIR / "history.json", history)
                return True
            except (OSError, TypeError, ValueError):
                return False
