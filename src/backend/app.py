from flask import Flask, jsonify
from pathlib import Path

from routes.exercise_routes import exercise_bp
from routes.profile_routes import profile_bp

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"


# Flask application setup
app = Flask(
    __name__,
    static_folder=str(FRONTEND_DIR),
    static_url_path="",
)

# Register feature routes
app.register_blueprint(exercise_bp)
app.register_blueprint(profile_bp)


@app.route("/")
def home():
    return app.send_static_file("index.html")


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True)
