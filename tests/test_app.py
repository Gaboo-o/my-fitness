import pytest

from src.backend.app import app, JSONStorage


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