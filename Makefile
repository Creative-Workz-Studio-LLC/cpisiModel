# [S-build-makefile] cpisiModel Build & Deployment System
# ==============================================================================

# 1. Jurisdictions
USER_BIN := $(HOME)/.local/share/cpisi/bin
USER_DATA := $(HOME)/.local/share/cpisi/data/$(USER)
GAME_DIR := THE_GAME/game-engine
PORTAL_DIR := 02_body/a-ladder/portal/client
WEB_DIST := 03_tov/a-ladder/sharing/web

# 2. The Anchor
.PHONY: all setup build install clean sync

all: setup build install

# 3. The Setup (Badal)
setup:
	@echo "[SETUP] Creating Local Sanctuaries..."
	@mkdir -p $(USER_BIN)
	@mkdir -p $(USER_DATA)
	@mkdir -p $(WEB_DIST)

# 4. The Build (Act)
build: build-engine build-portal

build-engine:
	@echo "[BUILD] Striking the Rust Game Engine (WASM)..."
	@cd $(GAME_DIR) && wasm-pack build --target web --out-dir ../../$(WEB_DIST)/pkg

build-portal:
	@echo "[BUILD] Striking the Go Sync Client..."
	@cd $(PORTAL_DIR) && go build -o ../../../../../bin/sync-client .

# 5. The Install (Locus)
install:
	@echo "[INSTALL] Projecting Binaries to Local Share..."
	@cp 02_body/a-ladder/portal/bin/sync-client $(USER_BIN)/
	@cp THE_GAME/meta/turn_manager.sh $(USER_BIN)/
	@cp THE_GAME/game-engine/www/index.html $(WEB_DIST)/
	@cp THE_GAME/game-engine/www/index.js $(WEB_DIST)/
	@cp THE_GAME/cpisi-game.desktop $(HOME)/.local/share/applications/
	@echo "[INSTALL] All systems Projected. 0.0 Yashar."

# 6. Shell Integration
alias:
	@echo "alias cpisi-sync='$(USER_BIN)/sync-client'" >> $(HOME)/.bashrc
	@echo "alias cpisi-game='xdg-open http://sync.cws.studio'" >> $(HOME)/.bashrc
	@echo "[SHELL] Aliases added to ~/.bashrc. Please run 'source ~/.bashrc'."

# 6. The Heartbeat (Sync)
sync:
	@echo "[SYNC] Firing the 3-Way Heartbeat..."
	@bash 02_body/c-hybrid/hooks/sync_all.sh

clean:
	@echo "[CLEAN] Purging the Dust of Execution..."
	@rm -rf $(WEB_DIST)/*
	@rm -rf $(GAME_DIR)/target
	@rm -rf $(GAME_DIR)/pkg
