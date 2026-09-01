#!/bin/bash
FLAG="${FLAG:-FLAG{default_ssrf_flag}}"
echo "$FLAG" > /root/flag.txt
# Simulate cloud metadata endpoint
mkdir -p /tmp/metadata/latest/meta-data/iam/security-credentials/
echo "$FLAG" > /tmp/metadata/latest/meta-data/iam/security-credentials/vulnapp-role
echo "ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE" > /tmp/metadata/latest/meta-data/iam/security-credentials/vulnapp-role
echo "SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" >> /tmp/metadata/latest/meta-data/iam/security-credentials/vulnapp-role
echo "$FLAG" > /tmp/metadata/flag
echo "[+] SSRF flag at /tmp/metadata/flag: $FLAG"
