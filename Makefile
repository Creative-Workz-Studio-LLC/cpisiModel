# [S-build-makefile] cpisiModel Production Build System (CLI FIRST)
# ==============================================================================

# 1. Jurisdictions
USER_BIN    := $(HOME)/.local/share/cpisi/bin
USER_DATA   := $(HOME)/.local/share/cpisi/data/$(USER)
USER_CACHE  := $(HOME)/.local/share/cpisi/build-cache
PROJECT_BIN := bin

# Tiered Game Paths
GAME_ROOT   := THE_GAME
GAME_DIR    := $(GAME_ROOT)/b-spiral/body/rust
GAME_RULES  := $(GAME_ROOT)/a-ladder/Rules
GAME_META   := $(GAME_ROOT)/b-spiral/meta

# Engine Jurisdictions
GATE_DIR    := 02_body/a-ladder/gate/client
HOOKS_DIR   := 02_body/c-hybrid/hooks
VOID_DIR    := 02_body/c-hybrid/void
GATE_DIST   := 03_tov/a-ladder/gate

# 2. The Anchor
.PHONY: all setup test build install clean sync alias

all: setup build install

# 3. The Setup (Badal)
setup:
	@echo "[SETUP] Creating Local Sanctuaries..."
	@mkdir -p $(USER_BIN)
	@mkdir -p $(USER_DATA)
	@mkdir -p $(USER_CACHE)
	@mkdir -p $(PROJECT_BIN)
	@mkdir -p $(GATE_DIST)

# 4. The Witness (Test)
test:
	@echo "[TEST] Striking the Court of 36..."
	@bash $(VOID_DIR)/court_runner.sh

# 5. The Build (Act)
build: build-engine build-gate

build-engine:
	@echo "[BUILD] Striking the Rust Game Engine (CLI Native)..."
	@cd $(GAME_DIR) && CARGO_TARGET_DIR=$(USER_CACHE)/game-engine cargo build --release
	@cp $(USER_CACHE)/game-engine/release/cpisi-game $(PROJECT_BIN)/

build-gate:
	@echo "[BUILD] Striking the Go Sync Client..."
	@cd $(GATE_DIR) && go build -o ../../../../$(PROJECT_BIN)/sync-client .

# 6. The Install (Locus)
install:
	@echo "[INSTALL] Projecting Binaries to Local Share..."
	@cp $(PROJECT_BIN)/sync-client $(USER_BIN)/
	@cp $(PROJECT_BIN)/cpisi-game $(USER_BIN)/
	@cp $(GAME_META)/turn_manager.sh $(USER_BIN)/
	@cp $(GAME_ROOT)/a-ladder/config/cpisi-dawndusk-game.desktop $(HOME)/.local/share/applications/
	@echo "[INSTALL] All systems Projected. 0.0 Yashar."

# 7. Shell Integration
alias:
	@grep -q "alias cpisi-sync" $(HOME)/.bashrc || echo "alias cpisi-sync='$(USER_BIN)/sync-client'" >> $(HOME)/.bashrc
	@grep -q "alias cpisi-game" $(HOME)/.bashrc || echo "alias cpisi-game='$(USER_BIN)/cpisi-game'" >> $(HOME)/.bashrc
	@echo "[SHELL] Aliases verified in ~/.bashrc. Please run 'source ~/.bashrc'."

# 8. The Heartbeat (Sync)
sync:
	@echo "[SYNC] Firing the 3-Way Heartbeat..."
	@bash $(HOOKS_DIR)/sync_all.sh

clean:
	@echo "[CLEAN] Purging the Dust of Execution..."
	@rm -rf $(GATE_DIST)/*
	@rm -rf $(PROJECT_BIN)/*
	@rm -rf $(GAME_DIR)/target
