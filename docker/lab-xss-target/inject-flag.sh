#!/bin/bash
FLAG="${FLAG:-FLAG{default_xss_flag}}"
FLAG_FILE="${FLAG_FILE:-/root/flag.txt}"
echo "$FLAG" > "$FLAG_FILE"
chmod 600 "$FLAG_FILE"
# The "admin" bot checks comments every 30s — its cookie contains the flag
echo "$FLAG" > /tmp/admin_cookie
echo "[+] Flag injected as admin cookie: $FLAG"
