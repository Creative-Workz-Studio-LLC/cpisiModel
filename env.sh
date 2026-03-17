#!/bin/bash
# env.sh: Sourcing the global CPISI environment

# Locate the root .env relative to this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ENV_PATH="$DIR/.env"

if [ -f "$ENV_PATH" ]; then
    echo "[CPISI] Sourcing environment from $ENV_PATH"
    # Export all variables defined in .env
    set -a
    source "$ENV_PATH"
    set +a
else
    echo "[!] .env not found at $ENV_PATH"
fi
