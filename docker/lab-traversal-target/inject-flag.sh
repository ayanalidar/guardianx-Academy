#!/bin/bash
FLAG="${FLAG:-FLAG{default_traversal_flag}}"
echo "$FLAG" > /root/flag.txt
chmod 600 /root/flag.txt
# Also put flag in /etc/passwd GECOS field (for the lab objective)
sed -i "s#root:x:0:0:root:/root:/bin/bash#root:x:0:0:$FLAG:/root:/bin/bash#" /etc/passwd
echo "[+] Flag in /root/flag.txt and /etc/passwd: $FLAG"
