"""GuardianX Lab — Generic Target Web Server"""
from flask import Flask
app = Flask(__name__)

@app.route("/")
def index():
    return "<h1>GuardianX Lab Target</h1><p>Find the flag at /root/flag.txt</p>"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
