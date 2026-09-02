# GuardianX Lab — Command Injection Target
# A "ping" tool that doesn't sanitize the host parameter.

FROM python:3.11-slim
RUN apt-get update && apt-get install -y iputils-ping && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY app/ /app/
COPY inject-flag.sh /inject-flag.sh
RUN chmod +x /inject-flag.sh
EXPOSE 80
CMD ["/bin/bash", "-c", "/inject-flag.sh && python3 app.py"]
