#!/bin/bash
FLAG="${FLAG:-FLAG{default_privesc_flag}}"
FLAG_FILE="${FLAG_FILE:-/root/flag.txt}"
echo "$FLAG" > "$FLAG_FILE"
chmod 600 "$FLAG_FILE"
chown root:root "$FLAG_FILE"
echo "[+] Flag injected: $FLAG"
