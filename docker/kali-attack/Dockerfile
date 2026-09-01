# GuardianX Kali Attack Container
# Pre-built with all pentesting tools needed for labs.
# Students get a shell in this container to attack the target.

FROM kalilinux/kali-rolling

# Avoid interactive prompts during install
ENV DEBIAN_FRONTEND=noninteractive

# Update and install all pentesting tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Core tools
    curl wget git vim nano tmux screen \
    netcat-traditional ncat socat \
    python3 python3-pip python3-venv \
    # Network tools
    nmap masscan rustscan \
    tcpdump tshark wireshark-common \
    traceroute mtr dnsutils \
    # Web tools
    sqlmap nikto dirb dirbuster gobuster \
    wpscan whatweb httpie \
    # Password cracking
    john hashcat hydra medusa \
    wordlists seclists \
    # Exploitation
    metasploit-framework \
    searchsploit \
    # Reverse engineering
    gdb ghidra radare2 \
    binwalk foremost \
    # Crypto
    openssl hashid \
    # Misc
    jq xmlstarlet \
    # Shell tools
    bash-completion \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install additional Python tools
RUN pip3 install --break-system-packages \
    requests beautifulsoup4 \
    pwntools cryptography \
    flask

# Create working directory
WORKDIR /root

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create lab directories
RUN mkdir -p /root/wordlists /root/tools /root/loot /root/scripts

# Symlink seclists for convenience
RUN ln -sf /usr/share/seclists /root/wordlists/seclists 2>/dev/null || true
RUN ln -sf /usr/share/wordlists/rockyou.txt /root/wordlists/rockyou.txt 2>/dev/null || true

# Expose common ports (for reverse shells, listeners, etc.)
EXPOSE 4444 4445 8080 8888

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD pgrep -x bash > /dev/null || exit 1

# Start with bash shell (the terminal gateway connects here)
ENTRYPOINT ["/entrypoint.sh"]
CMD ["bash"]
