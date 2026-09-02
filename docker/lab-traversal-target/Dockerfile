# GuardianX Lab — Directory Traversal Target
# A file viewer that doesn't sanitize path traversal sequences.

FROM python:3.11-slim
WORKDIR /app
COPY app/ /app/
COPY inject-flag.sh /inject-flag.sh
RUN chmod +x /inject-flag.sh
# Create some files for the viewer
RUN mkdir -p /var/www/files && echo "Welcome file" > /var/www/files/welcome.txt && \
    echo "About us" > /var/www/files/about.txt
EXPOSE 80
CMD ["/bin/bash", "-c", "/inject-flag.sh && python3 app.py"]
