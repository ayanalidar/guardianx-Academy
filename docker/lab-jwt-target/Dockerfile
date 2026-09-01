# GuardianX Lab — JWT Token Forgery Target
# An API that uses JWT with a weak HMAC secret (crackable with rockyou.txt).

FROM python:3.11-slim
RUN pip install --no-cache-dir flask pyjwt
WORKDIR /app
COPY app/ /app/
COPY inject-flag.sh /inject-flag.sh
RUN chmod +x /inject-flag.sh
EXPOSE 80
CMD ["/bin/bash", "-c", "/inject-flag.sh && python3 app.py"]
