"""GuardianX Lab — Vulnerable IDOR API"""
from flask import Flask, request, jsonify
import json, os

app = Flask(__name__)

# In-memory user database
USERS = {
    1: {"id": 1, "name": "admin", "email": "admin@vulnapp.local", "role": "admin", "secret_notes": "FLAG_PLACEHOLDER"},
    2: {"id": 2, "name": "guest", "email": "guest@vulnapp.local", "role": "user", "secret_notes": "No secrets here"},
    3: {"id": 3, "name": "user1", "email": "user1@vulnapp.local", "role": "user", "secret_notes": "Nothing"},
    4: {"id": 4, "name": "user2", "email": "user2@vulnapp.local", "role": "user", "secret_notes": "Nothing"},
    5: {"id": 5, "name": "user3", "email": "user3@vulnapp.local", "role": "user", "secret_notes": "Nothing"},
    6: {"id": 6, "name": "user4", "email": "user4@vulnapp.local", "role": "user", "secret_notes": "Nothing"},
    7: {"id": 7, "name": "user5", "email": "user5@vulnapp.local", "role": "user", "secret_notes": "Nothing"},
}

# Inject flag on startup
def inject_flag():
    flag = os.environ.get("FLAG", "FLAG{default_idor_flag}")
    flag_file = os.environ.get("FLAG_FILE", "/root/flag.txt")
    try:
        with open(flag_file, "w") as f:
            f.write(flag)
        os.chmod(flag_file, 0o600)
    except:
        pass
    USERS[1]["secret_notes"] = flag

@app.route("/")
def index():
    return jsonify({"message": "VulnApp API", "endpoints": ["/api/users/<id>/profile"]})

@app.route("/api/users/<int:user_id>/profile")
def get_profile(user_id):
    # VULNERABLE: No ownership check — any user can view any other user's profile
    user = USERS.get(user_id)
    if user:
        return jsonify(user)
    return jsonify({"error": "User not found"}), 404

if __name__ == "__main__":
    inject_flag()
    app.run(host="0.0.0.0", port=80)
