#!/bin/bash
# Inject the dynamic flag into /root/flag.txt
FLAG="${FLAG:-FLAG{default_nmap_flag}}"
FLAG_FILE="${FLAG_FILE:-/root/flag.txt}"
echo "$FLAG" > "$FLAG_FILE"
chmod 600 "$FLAG_FILE"
# Also put flag in the custom service response
echo "<html><body><h1>Service: $(cat $FLAG_FILE)</h1></body></html>" > /opt/service/index.html
echo "[+] Flag injected: $FLAG"
