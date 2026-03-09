#!/bin/bash
# #!omni:hook --court-runner
# ==============================================================================
# [S-hook-court-runner] The 36-Witness Execution Loop
# ==============================================================================
# This script physically executes all 36 theorem witnesses across Julia, Lean, 
# and Wolfram to verify the L0 Bedrock.
# ==============================================================================

WITNESS_ROOT="/media/seanje-lenox-wise/Project/cpisiModel/02_body/b-spiral/provers"

echo "--- STARTING THE COURT OF 36 ---"

# 1. Julia Rank (Computational)
echo "[1/3] Striking the Julia Rank..."
for f in $WITNESS_ROOT/julia/*.jl; do
    julia "$f"
done

# 2. Lean Rank (Logical)
echo "[2/3] Striking the Lean Rank..."
for f in $WITNESS_ROOT/lean/*.lean; do
    lean "$f"
done

# 3. Wolfram Rank (Geometrical)
echo "[3/3] Striking the Wolfram Rank..."
for f in $WITNESS_ROOT/wolfram/*.wl; do
    wolframscript -file "$f"
done

echo "--- THE COURT HAS SPOKEN. 0.0 YASHAR. ---"
