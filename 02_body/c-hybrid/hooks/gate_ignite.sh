#!/bin/bash
# #!omni:hook --gate-ignite
# ==============================================================================
# [S-hook-gate-ignite] The Full System Initialization (Production Grade)
# ==============================================================================
# This script ignites the entire 3-Way Sync / Gate ecosystem.
# It starts the server, the tunnel, and the sentinel using the tiered paths.
# ==============================================================================

PROJECT_ROOT="/media/seanje-lenox-wise/Project/cpisiModel"
BIN_DIR="/home/seanje-lenox-wise/.local/share/cpisi/bin"
BERESHIT_ROOT="/media/seanje-lenox-wise/Project/Bereshit"

echo "[GATE] Igniting the Dawndusk Ecosystem..."

# 1. Start the cws-server (Body Heart)
# Pointing to the tiered Game GUI and the Bereshit builder config
echo "[1/3] Starting cws-server..."
pkill cws-server || true
$BIN_DIR/cws-server \
    --dev \
    --port 3847 \
    --website-dir "${PROJECT_ROOT}/03_tov/a-ladder/gate/" \
    --builder-dir "${BERESHIT_ROOT}/company-docs/" > "${PROJECT_ROOT}/cws-server.log" 2>&1 &

# 2. Start the Cloudflare Tunnel (The Bridge)
echo "[2/3] Starting Cloudflare Bridge..."
pkill cloudflared || true
cloudflared tunnel --config "${PROJECT_ROOT}/02_body/a-ladder/gate/tunnel_config.yml" run cpisi-bridge &

# 3. Start the Sandbox Sentinel (The Guard)
echo "[3/3] Starting Sandbox Sentinel..."
docker start cpisi-sentinel || docker run -d --name cpisi-sentinel -v "${PROJECT_ROOT}/02_body/b-spiral/sandbox:/root/sandbox" cpisi-agent-node:a-01.01 ./sandbox-engine

echo "[GATE] All systems Go. 0.0 Yashar."
