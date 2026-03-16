#!/bin/bash
# #!omni:hook --sentinel-entry
# ==============================================================================
# [S-hook-sentinel-entry] The SSH Entry Point
# ==============================================================================
# This script is the ForceCommand for the mobile SSH session.
# It restricts the user to the Sandbox and manages the pulse injection.
# ==============================================================================

echo "--- DAWNDUSK GATE ACTIVE ---"
echo "Jurisdiction: B-sanctuary-sandbox"
echo "State: Awaiting Pulse"
echo "------------------------------"

# Allow simple interaction or drop into a restricted shell/loop
# For now, we provide a simple pulse injector
read -p "Enter Pulse (e.g. act LS): " PULSE
echo "$PULSE" > /root/sandbox/command_buffer.omnicog
echo "[GATE] Pulse Injected. Sentinel is processing."
exit 0
