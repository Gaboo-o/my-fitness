
from datetime import date
import math

from storage import JSONStorage


class ExerciseService:
    @staticmethod
    def get_matching_exercises(workout_type, location):
        """Fetches exercise data from storage and applies filters."""

        exercises = JSONStorage.read_exercises()

        if exercises is None:
            return None

        if workout_type:
            exercises = [
                exercise
                for exercise in exercises
                if exercise.get("type", "").lower()
                == workout_type.lower()
            ]

        if location:
            exercises = [
                exercise
                for exercise in exercises
                if location.lower()
                in str(exercise.get("location", "")).lower()
                or str(exercise.get("location", "")).lower() == "any"
            ]

        return exercises


class ProfileService:
    @staticmethod
    def get_profile():
        """Returns the saved profile."""
        return JSONStorage.read_profile()

    @staticmethod
    def validate_and_save_profile(profile_data):
        """Validates incoming profile data and saves it."""

        if not isinstance(profile_data, dict):
            return None, "Profile data must be a JSON object."

        name = str(profile_data.get("name", "")).strip()

        fitness_goal = str(
            profile_data.get("fitnessGoal", "")
        ).strip()

        if not name:
            return None, "Name is required."

        age = profile_data.get("age")
        height = profile_data.get("height")
        weight = profile_data.get("weight")

        try:
            age = int(age) if age not in (None, "") else None

            if age is not None and age <= 0:
                raise ValueError

        except (TypeError, ValueError):
            return None, "Age must be a positive whole number."

        try:
            height = (
                float(height)
                if height not in (None, "")
                else None
            )

            if height is not None and height <= 0:
                raise ValueError

        except (TypeError, ValueError):
            return None, "Height must be a positive number."

        try:
            weight = (
                float(weight)
                if weight not in (None, "")
                else None
            )

            if weight is not None and weight <= 0:
                raise ValueError

        except (TypeError, ValueError):
            return None, "Weight must be a positive number."

        profile = {
            "name": name,
            "age": age,
            "height": height,
            "weight": weight,
            "fitnessGoal": fitness_goal,
        }

        if not JSONStorage.write_profile(profile):
            return None, "Unable to save profile."

        return profile, None


# -------------------------
# Weight Tracking Service
# -------------------------

class WeightService:
    """Business logic for recording and reviewing weight entries."""

    POUNDS_PER_KG = 2.2046226218

    @staticmethod
    def get_weight_history():
        """Returns recorded weight entries sorted by date."""

        history = JSONStorage.read_weight_history()

        if history is None:
            return None

        return sorted(
            history,
            key=lambda entry: entry.get("date", "")
        )

    @staticmethod
    def save_weight(weight_data):
        """Validates and stores a dated weight entry."""

        if not isinstance(weight_data, dict):
            return None, "Weight data must be a JSON object.", 400

        weight_value = weight_data.get("weight")
        unit = weight_data.get("unit", "kg")
        date_text = weight_data.get("date")

        if isinstance(weight_value, bool):
            return None, "Weight must be a valid number.", 400

        try:
            weight = float(weight_value)

            if not math.isfinite(weight) or weight <= 0:
                raise ValueError

        except (TypeError, ValueError, OverflowError):
            return None, "Weight must be a positive number.", 400

        if not isinstance(unit, str):
            return None, "Unit must be kg or lb.", 400

        unit = unit.strip().lower()

        if unit not in ("kg", "lb"):
            return None, "Unit must be kg or lb.", 400

        if not isinstance(date_text, str):
            return None, "A valid date is required.", 400

        try:
            entry_date = date.fromisoformat(date_text)

            if entry_date.isoformat() != date_text:
                raise ValueError

        except ValueError:
            return None, "Date must use YYYY-MM-DD format.", 400

        if entry_date > date.today():
            return None, "Future dates are not allowed.", 400

        # Store weights in kilograms for consistent comparisons.
        if unit == "lb":
            weight_kg = weight / WeightService.POUNDS_PER_KG
        else:
            weight_kg = weight

        if weight_kg > 500:
            return None, "Weight exceeds the supported range.", 400

        history = JSONStorage.read_weight_history()

        if history is None:
            return None, "Unable to read weight history.", 500

        new_entry = {
            "date": entry_date.isoformat(),
            "weightKg": round(weight_kg, 4),
        }

        # Updating an entry on the same date replaces the old value.
        history = [
            entry
            for entry in history
            if entry.get("date") != new_entry["date"]
        ]

        history.append(new_entry)

        history.sort(
            key=lambda entry: entry.get("date", "")
        )

        if not JSONStorage.write_weight_history(history):
            return None, "Unable to save weight history.", 500

        return new_entry, None, 201
