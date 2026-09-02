# GuardianX Lab — SSRF Target (Cloud Metadata)
# A URL fetcher that doesn't validate the target URL.

FROM python:3.11-slim
RUN pip install --no-cache-dir flask requests
WORKDIR /app
COPY app/ /app/
COPY inject-flag.sh /inject-flag.sh
RUN chmod +x /inject-flag.sh
EXPOSE 80
CMD ["/bin/bash", "-c", "/inject-flag.sh && python3 app.py"]
