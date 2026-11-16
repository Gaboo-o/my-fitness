import pytest

from app import app
from storage import JSONStorage
from services import ProfileService
import routes.auth_routes as auth_routes
from services import ProfileService, HistoryService


@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client


def test_home_page(client):
    response = client.get("/")

    assert response.status_code == 200


def test_health_endpoint(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}


def test_get_all_exercises(client, monkeypatch):
    exercises = [
        {
            "name": "Push Up",
            "type": "strength",
            "location": "home",
            "muscleGroup": "chest",
        },
        {
            "name": "Running",
            "type": "cardio",
            "location": "gym",
            "muscleGroup": "legs",
        },
    ]

    monkeypatch.setattr(
        JSONStorage,
        "read_exercises",
        lambda: exercises
    )

    response = client.get("/api/exercises")

    assert response.status_code == 200
    assert response.get_json() == exercises


def test_filter_exercises_by_type(client, monkeypatch):
    exercises = [
        {
            "name": "Push Up",
            "type": "strength",
            "location": "home",
            "muscleGroup": "chest",
        },
        {
            "name": "Running",
            "type": "cardio",
            "location": "gym",
            "muscleGroup": "legs",
        },
    ]

    monkeypatch.setattr(
        JSONStorage,
        "read_exercises",
        lambda: exercises
    )

    response = client.get("/api/exercises?type=strength")

    assert response.status_code == 200
    assert response.get_json() == [exercises[0]]


def test_filter_exercises_by_location(client, monkeypatch):
    exercises = [
        {
            "name": "Push Up",
            "type": "strength",
            "location": "home",
            "muscleGroup": "chest",
        },
        {
            "name": "Running",
            "type": "cardio",
            "location": "gym",
            "muscleGroup": "legs",
        },
    ]

    monkeypatch.setattr(
        JSONStorage,
        "read_exercises",
        lambda: exercises
    )

    response = client.get("/api/exercises?location=gym")

    assert response.status_code == 200
    assert response.get_json() == [exercises[1]]


def test_filter_exercises_by_type_and_location(client, monkeypatch):
    exercises = [
        {
            "name": "Push Up",
            "type": "strength",
            "location": "home",
            "muscleGroup": "chest",
        },
        {
            "name": "Bench Press",
            "type": "strength",
            "location": "gym",
            "muscleGroup": "chest",
        },
        {
            "name": "Running",
            "type": "cardio",
            "location": "gym",
            "muscleGroup": "legs",
        },
    ]

    monkeypatch.setattr(
        JSONStorage,
        "read_exercises",
        lambda: exercises
    )

    response = client.get(
        "/api/exercises?type=strength&location=gym"
    )

    assert response.status_code == 200
    assert response.get_json() == [exercises[1]]


def test_missing_exercise_dataset_returns_404(client, monkeypatch):
    monkeypatch.setattr(
        JSONStorage,
        "read_exercises",
        lambda: None
    )

    response = client.get("/api/exercises")

    assert response.status_code == 404
    assert "error" in response.get_json()

def test_save_workout_marks_completed(client, monkeypatch):
    saved = []
    monkeypatch.setattr(JSONStorage, "append_workout", lambda record: saved.append(record) or True)
    response = client.post("/api/history", json={
        "type": "Strength", "location": "Home", "exercises": ["Push-Ups"]
    })
    assert response.status_code == 201
    assert len(saved) == 1
    assert saved[0]["id"]
    assert saved[0]["status"] == "completed"
    assert saved[0]["completed_at"]


def test_progress_excludes_uncompleted_workouts(client, monkeypatch):
    from datetime import date
    today = date.today().isoformat()
    monkeypatch.setattr(JSONStorage, "read_workout_history", lambda: [
        {"date": today, "status": "completed"},
        {"date": today, "status": "in_progress"},
    ])
    response = client.get("/api/progress")
    assert response.status_code == 200
    result = response.get_json()
    assert result["totalCount"] == 1
    assert result["weeklyCount"] == 1
    assert len(result["dailyCounts"]) == 7


def test_automatic_milestone_uses_completed_history(client, monkeypatch, tmp_path):
    import routes.milestone_routes as milestones
    from datetime import date
    monkeypatch.setattr(milestones, "DATA_FILE", tmp_path / "milestones.json")
    monkeypatch.setattr(JSONStorage, "read_workout_history", lambda: [
        {"date": date.today().isoformat(), "status": "completed"}
    ])
    response = client.post("/api/milestones", json={
        "title": "First workout", "target": 1, "unit": "workouts", "metric": "total_workouts"
    })
    assert response.status_code == 201
    result = client.get("/api/milestones").get_json()
    assert result[0]["progress"] == 1
    assert result[0]["status"] == "completed"

def test_get_profile(client, monkeypatch):
    profile = {
        "name": "Test User",
        "age": 25,
        "height": 5.7,
        "weight": 150,
        "fitnessGoal": "General fitness",
    }

    monkeypatch.setattr(
        ProfileService,
        "get_profile",
        lambda: profile
    )

    response = client.get("/api/profile")

    assert response.status_code == 200
    assert response.get_json() == profile


def test_update_profile(client, monkeypatch):
    profile = {
        "name": "Test User",
        "age": 25,
        "height": 5.7,
        "weight": 150,
        "fitnessGoal": "General fitness",
    }

    monkeypatch.setattr(
        ProfileService,
        "validate_and_save_profile",
        lambda data: (data, None)
    )

    response = client.put("/api/profile", json=profile)

    assert response.status_code == 200
    assert response.get_json() == {
        "message": "Profile saved successfully.",
        "profile": profile,
    }


def test_update_profile_requires_json(client):
    response = client.put("/api/profile")

    assert response.status_code == 400
    assert "error" in response.get_json()

def test_signup_successful(client, monkeypatch):
    mock_db = {}
    monkeypatch.setattr(auth_routes, "load_users", lambda: mock_db)
    monkeypatch.setattr(auth_routes, "save_users", lambda data: mock_db.update(data))
    
    response = client.post("/api/signup", json={
        "username": "testuser", 
        "password": "password123"
    })
    
    assert response.status_code == 201
    assert "testuser" in mock_db

def test_login_successful(client, monkeypatch):
    mock_db = {"existinguser": {"password": "mypassword"}}
    monkeypatch.setattr(auth_routes, "load_users", lambda: mock_db)
    
    response = client.post("/api/login", json={
        "username": "existinguser", 
        "password": "mypassword"
    })
    
    assert response.status_code == 200
    assert response.get_json()["username"] == "existinguser"

def test_login_invalid_credentials(client, monkeypatch):
    mock_db = {"existinguser": {"password": "mypassword"}}
    monkeypatch.setattr(auth_routes, "load_users", lambda: mock_db)
    
    response = client.post("/api/login", json={
        "username": "existinguser", 
        "password": "wrongpassword"
    })
    
    assert response.status_code == 401
    assert "error" in response.get_json()

def test_profile_saves_bmi_requirements(client, monkeypatch):
    """Verifies the backend properly accepts and stores the decimal height and weight required by the frontend BMI calculator."""
    profile_data = {
        "name": "Thanh",
        "age": 23,
        "height": 5.58,  
        "weight": 125.0, 
        "fitnessGoal": "Muscle"
    }
    
    monkeypatch.setattr(ProfileService, "validate_and_save_profile", lambda data: (data, None))
    
    response = client.put("/api/profile", json=profile_data)
    assert response.status_code == 200
    
    result = response.get_json()
    assert result["profile"]["height"] == 5.58
    assert result["profile"]["weight"] == 125.0

def test_history_saves_custom_workout(client, monkeypatch):
    """Verifies the history route can accept a custom-built array of exercises rather than just a generated string."""
    custom_workout = {
        "type": "Custom",
        "location": "Home",
        "exercises": ["Push-Ups", "Squats", "Plank", "Burpees"], 
        "status": "completed"
    }
    
    monkeypatch.setattr(HistoryService, "save_workout", lambda data: (data, None))
    
    response = client.post("/api/history", json=custom_workout)
    
    assert response.status_code == 201
    assert response.get_json()["message"] == "Workout saved successfully."
    assert len(response.get_json()["workout"]["exercises"]) == 4