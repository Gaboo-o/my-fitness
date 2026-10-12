from storage import JSONStorage


class ExerciseService:
    @staticmethod
    def get_matching_exercises(workout_type, location):
        """Fetches exercise data from storage and applies filters."""

        # Request data from storage
        exercises = JSONStorage.read_exercises()

        if exercises is None:
            return None

        # Apply Type filter
        if workout_type:
            exercises = [
                exercise
                for exercise in exercises
                if exercise.get("type", "").lower() == workout_type.lower()
            ]

        # Apply Location filter
        if location:
            exercises = [
                exercise
                for exercise in exercises
                if location.lower() in str(exercise.get("location", "")).lower()
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
        fitness_goal = str(profile_data.get("fitnessGoal", "")).strip()

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
            height = float(height) if height not in (None, "") else None
            if height is not None and height <= 0:
                raise ValueError
        except (TypeError, ValueError):
            return None, "Height must be a positive number."

        try:
            weight = float(weight) if weight not in (None, "") else None
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
