# GuardianX Lab — IDOR Target (Insecure Direct Object Reference)
# An API that trusts user-supplied IDs without ownership checks.

FROM python:3.11-slim
RUN pip install --no-cache-dir flask flask-session
WORKDIR /app
COPY app/ /app/
COPY inject-flag.sh /inject-flag.sh
RUN chmod +x /inject-flag.sh
EXPOSE 80
CMD ["/bin/bash", "-c", "/inject-flag.sh && python3 app.py"]
