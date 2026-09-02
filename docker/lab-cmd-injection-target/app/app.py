"""GuardianX Lab — Vulnerable Command Injection (Ping Tool)"""
from flask import Flask, request
import subprocess, html

app = Flask(__name__)

PAGE = """
<!DOCTYPE html><html><head><title>VulnApp — Ping Tool</title>
<style>body{font-family:monospace;background:#1a1a2e;color:#e8f5ee;margin:40px}
input{padding:8px;background:#0f3460;border:1px solid #10b981;color:#e8f5ee;border-radius:5px}
button{padding:8px;background:#10b981;color:#0a0f0d;border:none;border-radius:5px}
pre{background:#0f3460;padding:15px;border-radius:5px;overflow-x:auto}</style>
</head><body><h1>📡 Network Ping Tool</h1>
<form method="POST"><input name="host" placeholder="Enter IP or hostname" size=30>
<button>Ping</button></form><pre>%s</pre></body></html>
"""

@app.route("/", methods=["GET", "POST"])
def ping():
    output = ""
    if request.method == "POST":
        host = request.form.get("host", "")
        # VULNERABLE: Direct command injection — no sanitization
        try:
            result = subprocess.run(f"ping -c 2 {host}", shell=True, capture_output=True, text=True, timeout=10)
            output = result.stdout + result.stderr
        except Exception as e:
            output = str(e)
    return PAGE % html.escape(output)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
