from flask import Blueprint, request, jsonify
import json
from pathlib import Path

auth_bp = Blueprint("auth", __name__)
USERS_FILE = Path(__file__).resolve().parent.parent / "users.json"

def load_users():
    if not USERS_FILE.exists():
        return {}
    with open(USERS_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)

@auth_bp.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    users = load_users()
    if username in users:
        return jsonify({"error": "User already exists"}), 400
    
    users[username] = {"password": password}
    save_users(users)
    return jsonify({"message": "Signup successful! You can now log in."}), 201

@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    users = load_users()
    if username in users and users[username]["password"] == password:
        return jsonify({"message": "Login successful", "username": username}), 200
    
    return jsonify({"error": "Invalid username or password"}), 401