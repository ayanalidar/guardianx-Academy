# GuardianX Lab — Linux Privilege Escalation (SUID)
# A misconfigured SUID binary allows reading files as root.

FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-server \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create SSH config
RUN mkdir /run/sshd && \
    echo 'root:securepassword123' | chpasswd && \
    sed -i 's/#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Create low-privilege user
RUN useradd -m -s /bin/bash www-data 2>/dev/null || true && \
    echo 'www-data:wwwdata123' | chpasswd

# VULNERABILITY: Make /usr/bin/find SUID
# Students abuse: find . -exec cat /root/flag.txt \;
RUN chmod u+s /usr/bin/find

# Create flag injection script
COPY inject-flag.sh /inject-flag.sh
RUN chmod +x /inject-flag.sh

# Create startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 22
CMD ["/start.sh"]
