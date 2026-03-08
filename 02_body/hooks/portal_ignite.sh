#!/bin/bash
# #!omni:hook --portal-ignite
# ==============================================================================
# [S-hook-portal-ignite] The Full System Initialization
# ==============================================================================
# This script ignites the entire 3-Way Sync / Mobile Portal ecosystem.
# It starts the server, the tunnel, and the sentinel.
# ==============================================================================

PROJECT_ROOT="/media/seanje-lenox-wise/Project/cpisiModel"
BIN_DIR="/home/seanje-lenox-wise/.local/share/claude/bin"

echo "[PORTAL] Igniting the Dawndusk Ecosystem..."

# 1. Start the cws-server (Body Heart)
echo "[1/3] Starting cws-server..."
$BIN_DIR/cws-server &

# 2. Start the Cloudflare Tunnel (The Bridge)
echo "[2/3] Starting Cloudflare Bridge..."
cloudflared tunnel --config "${PROJECT_ROOT}/02_body/portal/tunnel_config.yml" run cpisi-bridge &

# 3. Start the Sandbox Sentinel (The Guard)
echo "[3/3] Starting Sandbox Sentinel..."
docker start cpisi-sentinel || docker run -d --name cpisi-sentinel -v "${PROJECT_ROOT}/02_body/sandbox:/root/mobile_sandbox" cpisi-agent-node:a-01.01 ./sandbox-engine

echo "[PORTAL] All systems Go. 0.0 Yashar."
