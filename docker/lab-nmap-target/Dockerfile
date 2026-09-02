# GuardianX Lab — Nmap Recon Target
# Multiple services running on different ports for scanning practice.

FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-server \
    apache2 \
    python3 \
    netcat-traditional \
    vsftpd \
    nginx \
    sqlite3 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Configure SSH (port 22)
RUN mkdir /run/sshd && \
    echo 'root:s3cur3p@ss' | chpasswd && \
    sed -i 's/#PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config

# Configure Apache (port 80)
RUN echo '<h1>VulnApp Web Server</h1><p>Flag is not here.</p>' > /var/www/html/index.html

# Configure a custom service on port 8080 (Python HTTP)
RUN mkdir -p /opt/service && \
    echo 'import http.server, socketserver' > /opt/service/server.py && \
    echo 'handler = http.server.SimpleHTTPRequestHandler' >> /opt/service/server.py && \
    echo 'with socketserver.TCPServer(("0.0.0.0", 8080), handler) as httpd:' >> /opt/service/server.py && \
    echo '    httpd.serve_forever()' >> /opt/service/server.py

# Configure FTP (port 21)
RUN echo "listen=YES" >> /etc/vsftpd.conf && \
    echo "anonymous_enable=YES" >> /etc/vsftpd.conf && \
    echo "anon_root=/var/ftp" >> /etc/vsftpd.conf && \
    mkdir -p /var/ftp/pub && \
    echo "Welcome to the FTP server. Flag is not here." > /var/ftp/pub/README.txt

# Create flag injection script
COPY inject-flag.sh /inject-flag.sh
RUN chmod +x /inject-flag.sh

# Create startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 22 80 8080 21

CMD ["/start.sh"]
