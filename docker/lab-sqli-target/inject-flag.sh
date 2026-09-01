#!/bin/bash
# Inject the dynamic flag into the database and filesystem.
# The orchestrator sets these env vars:
#   FLAG=FLAG{...}          — the dynamic flag
#   FLAG_FILE=/root/flag.txt — where to write it on the filesystem

FLAG="${FLAG:-FLAG{default_flag_not_set}}"
FLAG_FILE="${FLAG_FILE:-/root/flag.txt}"

# Write flag to filesystem
echo "$FLAG" > "$FLAG_FILE"
chmod 600 "$FLAG_FILE"

# Update the flag in the database
sqlite3 /var/lib/sqlite/vulnapp.db "UPDATE users SET flag='$FLAG' WHERE username='admin';"

echo "[+] Flag injected: $FLAG"
echo "[+] Flag file: $FLAG_FILE"
