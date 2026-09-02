# GuardianX Lab — Generic Target Template
# Used for labs that don't have a specific Docker image.
# A simple web server with a flag file.

FROM python:3.11-slim
WORKDIR /app
COPY app/ /app/
COPY inject-flag.sh /inject-flag.sh
RUN chmod +x /inject-flag.sh
EXPOSE 80
CMD ["/bin/bash", "-c", "/inject-flag.sh && python3 app.py"]
