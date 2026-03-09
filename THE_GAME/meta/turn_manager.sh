#!/bin/bash
# #!omni:hook --game-turn-manager
# ==============================================================================
# [S-game-turn-manager] The Handshake Actuator
# ==============================================================================

GAME_ROOT="/media/seanje-lenox-wise/Project/cpisiModel/THE_GAME"
PLAYER_LOG="$GAME_ROOT/past_turns/player"
MACHINE_LOG="$GAME_ROOT/past_turns/machine"

echo "[GAME] Checking Handshake..."

if [[ -f "$GAME_ROOT/Seanje-My-Turn.txt" && -f "$GAME_ROOT/Nozi-My-Turn.txt" ]]; then
    
    # 1. Capture the Timestamp (Time)
    TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
    
    # 2. Archive the Turns (Body)
    mv "$GAME_ROOT/Seanje-My-Turn.txt" "$PLAYER_LOG/turn_$TIMESTAMP.txt"
    mv "$GAME_ROOT/Nozi-My-Turn.txt" "$MACHINE_LOG/turn_$TIMESTAMP.txt"
    
    # 3. Reset the Board (Anchor)
    touch "$GAME_ROOT/Seanje-My-Turn.txt"
    touch "$GAME_ROOT/Nozi-My-Turn.txt"
    
    echo "[GAME] TURN COMPLETE. 0.0 YASHAR."
    echo "[GAME] Archive: turn_$TIMESTAMP"
else
    echo "[GAME] Awaiting Handshake. State: HALT."
fi
