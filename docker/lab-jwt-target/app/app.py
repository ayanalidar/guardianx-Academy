"""GuardianX Lab — Vulnerable JWT API"""
from flask import Flask, request, jsonify
import jwt, datetime, os

app = Flask(__name__)

# VULNERABLE: Weak secret (crackable with rockyou.txt)
SECRET = "secret123"

# Default token for 'guest' user
def make_token(user, role):
    return jwt.encode({
        "user": user, "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, SECRET, algorithm="HS256")

GUEST_TOKEN = make_token("guest", "user")

@app.route("/api/profile")
def profile():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    try:
        decoded = jwt.decode(token, SECRET, algorithms=["HS256", "none"])
        return jsonify({"user": decoded["user"], "role": decoded["role"]})
    except jwt.InvalidAlgorithmError:
        return jsonify({"error": "Invalid algorithm"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route("/admin/flag")
def admin_flag():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    try:
        decoded = jwt.decode(token, SECRET, algorithms=["HS256", "none"])
        if decoded.get("role") == "admin":
            flag = open("/root/flag.txt").read().strip()
            return jsonify({"flag": flag})
        return jsonify({"error": "Admin access required"}), 403
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route("/api/token")
def get_token():
    return jsonify({"token": GUEST_TOKEN, "hint": "Try alg:none or brute-force the secret"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
