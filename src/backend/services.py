from datetime import date, datetime, timedelta
from storage import JSONStorage


class ExerciseService:
    @staticmethod
    def get_matching_exercises(workout_type, location):
        exercises = JSONStorage.read_exercises()
        if exercises is None:
            return None
        if workout_type:
            exercises = [e for e in exercises if e.get("type", "").lower() == workout_type.lower()]
        if location:
            exercises = [
                e for e in exercises
                if location.lower() in str(e.get("location", "")).lower()
                or str(e.get("location", "")).lower() == "any"
            ]
        return exercises


class ProfileService:
    @staticmethod
    def get_profile():
        return JSONStorage.read_profile()

    @staticmethod
    def validate_and_save_profile(profile_data):
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
        profile = {"name": name, "age": age, "height": height, "weight": weight, "fitnessGoal": fitness_goal}
        if not JSONStorage.write_profile(profile):
            return None, "Unable to save profile."
        return profile, None


class HistoryService:
    @staticmethod
    def get_workout_history():
        return JSONStorage.read_workout_history()

    @staticmethod
    def save_workout(workout_data):
        if not isinstance(workout_data, dict):
            return None, "Workout data must be a JSON object."
        workout_type = workout_data.get("type")
        location = workout_data.get("location")
        exercises = workout_data.get("exercises")
        if not isinstance(workout_type, str) or not workout_type.strip():
            return None, "Workout type is required."
        if not isinstance(location, str) or not location.strip():
            return None, "Workout location is required."
        if not isinstance(exercises, list) or not exercises or any(
            not isinstance(e, str) or not e.strip() for e in exercises
        ):
            return None, "Exercises must be a non-empty list of names."

        # Record the server's local completion date; don't trust client-supplied dates.
        workout = {
            "date": date.today().isoformat(),
            "type": workout_type.strip(),
            "location": location.strip(),
            "exercises": [e.strip() for e in exercises],
        }
        if not JSONStorage.append_workout(workout):
            return None, "Unable to save workout history."
        return workout, None


class ProgressService:
    @staticmethod
    def get_progress_summary():
        history = JSONStorage.read_workout_history()
        if history is None:
            return None
        today = date.today()
        start_of_week = today - timedelta(days=today.weekday())
        weekly_count = 0
        monthly_count = 0
        for workout in history:
            if not isinstance(workout, dict):
                continue
            try:
                workout_date = datetime.strptime(workout.get("date", ""), "%Y-%m-%d").date()
            except (TypeError, ValueError):
                continue
            if start_of_week <= workout_date <= today:
                weekly_count += 1
            if workout_date.year == today.year and workout_date.month == today.month and workout_date <= today:
                monthly_count += 1
        return {"weeklyCount": weekly_count, "monthlyCount": monthly_count}
