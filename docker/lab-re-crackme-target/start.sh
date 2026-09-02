#!/bin/bash
/inject-flag.sh
/usr/sbin/sshd
echo "[+] SSH started on port 22. Login: guardian:guardian123"
echo "[+] Crackme binary at /home/guardian/crackme"
tail -f /dev/null
