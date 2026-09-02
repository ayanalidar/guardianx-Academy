#!/bin/bash
/inject-flag.sh
/usr/sbin/sshd
echo "[+] SSH started on port 22. Login: www-data:wwwdata123"
echo "[+] SUID binary: /usr/bin/find"
tail -f /dev/null
