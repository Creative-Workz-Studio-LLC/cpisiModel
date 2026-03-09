#!/bin/bash
# #!omni:hook --sync-all
# ==============================================================================
# [S-hook-sync-all] The Heartbeat Actuator
# ==============================================================================
# This script performs the Tripartite Synthesis, pushing the local state to 
# Google Drive and triggering the NotebookLM sync.
# ==============================================================================

PROJECT_ROOT="/media/seanje-lenox-wise/Project/cpisiModel"
DRIVE_DIR="/home/seanje-lenox-wise/Google Drive/cpisi_mobile_state"
NOTEBOOK_ID="d30c887d-a8d5-45cd-9fed-b169ec5d8d2b"

echo "[SYNC] Starting Heartbeat..."

# 1. Compile the Parchment (Mind -> Body)
cat "${PROJECT_ROOT}/DAWNDUSK_STATE_SYNC.md" > "${DRIVE_DIR}/current_state.md"

# 2. Add Standards and Lore to the Bridge
cat "${PROJECT_ROOT}/01_mind/a-ladder/standards/THE_TRANSLATION_LAYER.txt" >> "${DRIVE_DIR}/current_state.md"

echo "[SYNC] State Pushed to Google Drive."

# 3. Trigger NotebookLM Sync (Substrate Realization)
# We use uvx to ensure we use the proper authenticated nlm CLI.
# The command is 'sync sources' and needs -y to skip confirmation.
uvx --from notebooklm-mcp-cli nlm sync sources "${NOTEBOOK_ID}" -y

echo "[SYNC] NotebookLM Semantic Librarian Updated."
echo "[SYNC] Heartbeat Complete. 0.0 Yashar."
