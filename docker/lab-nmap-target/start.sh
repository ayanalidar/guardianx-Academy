#!/bin/bash
# Start all services for the Nmap recon lab

# Inject flag
/inject-flag.sh

# Start SSH
/usr/sbin/sshd

# Start Apache
apachectl start

# Start FTP
/usr/sbin/vsftpd &

# Start custom Python service on port 8080
cd /opt/service && python3 server.py &

# Start netcat listener on port 9999
while true; do echo "Banner: GuardianX Lab Service v1.0" | nc -l -p 9999; done &

echo "[+] All services started. Listening on ports: 22, 21, 80, 8080, 9999"

# Keep container alive
tail -f /dev/null
