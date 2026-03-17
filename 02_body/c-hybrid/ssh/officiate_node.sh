#!/bin/bash
# officiate_node.sh: Establish Sovereign Identity on this Laptop.

echo "═══ CPISI SOVEREIGN HANDSHAKE ═══"
echo "Target: Individual Kingdom Node"

# 1. Generate Sovereign SSH Key if missing
if [ ! -f ~/.ssh/id_cpisi ]; then
    echo "[1/3] Manifesting Sovereign Keys..."
    ssh-keygen -t ed25519 -f ~/.ssh/id_cpisi -N "" -C "CPISI-Node-$(hostname)"
else
    echo "[1/3] Sovereign Keys already present."
fi

# 2. Integrate CPISI SSH Config
echo "[2/3] Linking SSH Substrate..."
mkdir -p ~/.ssh
if ! grep -q "Include cpisi_config" ~/.ssh/config; then
    echo "Include cpisi_config" >> ~/.ssh/config
fi

# Copy the template to the local ssh folder
cp /media/seanje-lenox-wise/Project/cpisiModel/02_body/c-hybrid/ssh/cpisi_config ~/.ssh/cpisi_config

# 3. Verify GeminiCLI (cpisi-agent)
echo "[3/3] Officiating GeminiCLI (cpisi-agent)..."
if command -v cpisi-agent >/dev/null 2>&1; then
    echo "SUCCESS: Substrate Mind (cpisi-agent) is online."
else
    echo "WARNING: cpisi-agent not found in PATH. Please run 'make install' in Bereshit."
fi

echo "─────────────────────────────────"
echo "NODE OFFICIATED. You can now access this laptop"
echo "from the Sanctuary Gate via the SSH Substrate."
echo "0.0 YASHAR."
