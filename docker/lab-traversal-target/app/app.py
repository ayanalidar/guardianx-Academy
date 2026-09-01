"""GuardianX Lab — Vulnerable Directory Traversal (File Viewer)"""
from flask import Flask, request
import html, os

app = Flask(__name__)

BASE_DIR = "/var/www/files"

PAGE = """
<!DOCTYPE html><html><head><title>VulnApp — File Viewer</title>
<style>body{font-family:monospace;background:#1a1a2e;color:#e8f5ee;margin:40px}
input{padding:8px;width:300px;background:#0f3460;border:1px solid #10b981;color:#e8f5ee;border-radius:5px}
button{padding:8px;background:#10b981;color:#0a0f0d;border:none;border-radius:5px}
pre{background:#0f3460;padding:15px;border-radius:5px}</style>
</head><body><h1>📄 File Viewer</h1>
<form method="POST"><input name="file" placeholder="welcome.txt" size=40>
<button>View</button></form><pre>%s</pre>
<p>Available files: welcome.txt, about.txt</p></body></html>
"""

@app.route("/", methods=["GET", "POST"])
def view():
    output = "Enter a filename to view."
    if request.method == "POST":
        filename = request.form.get("file", "")
        # VULNERABLE: No path traversal protection
        filepath = os.path.join(BASE_DIR, filename)
        try:
            with open(filepath, "r") as f:
                output = f.read()
        except Exception as e:
            output = f"Error: {str(e)}"
    return PAGE % html.escape(str(output))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
