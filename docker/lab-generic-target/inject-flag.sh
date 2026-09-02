#!/bin/bash
FLAG="${FLAG:-FLAG{default_generic_flag}}"
echo "$FLAG" > /root/flag.txt
chmod 600 /root/flag.txt
echo "[+] Flag at /root/flag.txt: $FLAG"
