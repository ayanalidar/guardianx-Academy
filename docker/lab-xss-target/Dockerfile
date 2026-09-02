# GuardianX Lab — XSS Target (Stored XSS)
# A comment system that renders HTML without sanitization.

FROM python:3.11-slim

WORKDIR /app
COPY app/ /app/

RUN pip install --no-cache-dir flask flask-session

COPY inject-flag.sh /inject-flag.sh
RUN chmod +x /inject-flag.sh

EXPOSE 80
CMD ["/bin/bash", "-c", "/inject-flag.sh && python3 app.py"]
