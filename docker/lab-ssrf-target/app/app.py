"""GuardianX Lab — Vulnerable SSRF (URL Fetcher)"""
from flask import Flask, request
import requests, html

app = Flask(__name__)

PAGE = """
<!DOCTYPE html><html><head><title>VulnApp — URL Fetcher</title>
<style>body{font-family:monospace;background:#1a1a2e;color:#e8f5ee;margin:40px}
input{padding:8px;width:400px;background:#0f3460;border:1px solid #10b981;color:#e8f5ee;border-radius:5px}
button{padding:8px;background:#10b981;color:#0a0f0d;border:none;border-radius:5px}
pre{background:#0f3460;padding:15px;border-radius:5px;overflow-x:auto;white-space:pre-wrap;word-break:break-all}</style>
</head><body><h1>🌐 URL Fetcher</h1>
<form method="POST"><input name="url" placeholder="http://example.com" size=50>
<button>Fetch</button></form><pre>%s</pre>
<p>Hint: Try http://localhost/tmp/metadata/flag or file:///root/flag.txt</p></body></html>
"""

@app.route("/", methods=["GET", "POST"])
def fetch():
    output = "Enter a URL to fetch."
    if request.method == "POST":
        url = request.form.get("url", "")
        # VULNERABLE: No URL validation — allows internal IPs, file://, etc.
        try:
            if url.startswith("file://"):
                path = url[7:]
                with open(path, "r") as f:
                    output = f.read()
            elif "localhost" in url or "127.0.0.1" in url:
                # Simulate internal service
                path = url.split("localhost")[-1].split("127.0.0.1")[-1]
                if path.startswith("/tmp/metadata"):
                    try:
                        with open(path, "r") as f:
                            output = f.read()
                    except:
                        output = f"Internal resource: {path}"
                else:
                    output = f"Internal resource: {path}"
            else:
                resp = requests.get(url, timeout=5)
                output = resp.text[:2000]
        except Exception as e:
            output = f"Error: {str(e)}"
    return PAGE % html.escape(str(output))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
