"""GuardianX Lab — Vulnerable XSS Comment System"""
from flask import Flask, request, render_template_string, redirect
import os, threading, time, sqlite3

app = Flask(__name__)

DB = "/tmp/comments.db"

def init_db():
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY, name TEXT, content TEXT)")
    conn.commit()
    conn.close()

def admin_bot():
    """Simulates an admin viewing comments (their cookie = the flag)."""
    flag = open("/tmp/admin_cookie").read().strip()
    while True:
        time.sleep(30)
        # In a real lab, this would visit the comments page with the flag as a cookie

HTML = """
<!DOCTYPE html>
<html><head><title>VulnApp — Comments</title>
<style>body{font-family:monospace;background:#1a1a2e;color:#e8f5ee;margin:40px}
.box{background:#16213e;padding:20px;border-radius:10px;margin:10px 0}
form input,form textarea{width:100%;padding:8px;margin:5px 0;background:#0f3460;border:1px solid #10b981;color:#e8f5ee;border-radius:5px}
button{padding:10px 20px;background:#10b981;color:#0a0f0d;border:none;border-radius:5px;cursor:pointer}</style>
</head><body><h1>💬 VulnApp Comments</h1>
<form method="POST"><input name="name" placeholder="Your name"><br>
<textarea name="content" placeholder="Your comment" rows="3"></textarea><br>
<button>Post Comment</button></form>
{% for c in comments %}<div class="box"><b>{{ c[1] }}</b><br>{{ c[2] | safe }}</div>{% endfor %}
</body></html>
"""

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        name = request.form.get("name", "")
        content = request.form.get("content", "")
        conn = sqlite3.connect(DB)
        conn.execute("INSERT INTO comments (name, content) VALUES (?, ?)", (name, content))
        conn.commit()
        conn.close()
        return redirect("/")
    conn = sqlite3.connect(DB)
    comments = conn.execute("SELECT * FROM comments ORDER BY id DESC").fetchall()
    conn.close()
    return render_template_string(HTML, comments=comments)

if __name__ == "__main__":
    init_db()
    threading.Thread(target=admin_bot, daemon=True).start()
    app.run(host="0.0.0.0", port=80)
