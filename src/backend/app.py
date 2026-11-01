from pathlib import Path
from flask import Flask, jsonify

from routes.exercise_routes import exercise_bp
from routes.profile_routes import profile_bp
from routes.progress_routes import progress_bp
from routes.history_routes import history_bp

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")
app.register_blueprint(exercise_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(progress_bp)
app.register_blueprint(history_bp)

@app.route("/")
def home():
    return app.send_static_file("index.html")

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True)
