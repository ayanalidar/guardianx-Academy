#!/bin/bash
# GuardianX Kali Attack Container — Entrypoint
# Sets up the environment for the student's attack session.

# Print welcome banner
cat << 'BANNER'
  ___ _               _    ___           _        _ _ 
 / __| |_ ___ _ _ _ _| |_ | _ ) ___ _ __| |_  __ _| | |
| (__|  _/ _ \ '_| ' \  \| _ \/ -_) '_ \ ' \/ _` | | |
 \___|\__\___/_| |_||_|__/___/\___| .__/_||_\__,_|_|_|
                                   |_|              v2.0

  [i] GuardianX Lab Attack Machine
  [i] Type 'help' for available commands
  [i] Target IP is in $TARGET_IP environment variable

BANNER

# If TARGET_IP is set, show it
if [ -n "$TARGET_IP" ]; then
    echo "  [i] Target: $TARGET_IP"
    echo ""
fi

# Execute the main command (usually bash)
exec "$@"
