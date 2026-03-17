/**
 * VAULT SCREEN: The Holy of Holies Logic
 */
import { VaultActuator } from "../types/index.ts";
import { state } from "../core/state.ts";
import { toggleUIScale } from "../core/ui.ts";
import { config } from "../core/config.ts";

export const Vault: VaultActuator = {
    toggle: function() {
        const overlay = document.getElementById('vault-overlay');
        if (!overlay) return;
        
        const isOpening = overlay.style.display !== 'flex';
        overlay.style.display = isOpening ? 'flex' : 'none';
        
        if (isOpening) {
            this.init();
        }
    },

    init: function() {
        this.checkNetwork();
        this.checkDatabase();
        this.renderDynamics();
    },

    checkNetwork: async function() {
        const statusEl = document.getElementById('vault-network-status');
        if (!statusEl) return;

        statusEl.innerText = "NETWORK: PINGING...";
        try {
            const resp = await fetch(`${config.WORKER_URL}/health`, { method: 'GET' });
            if (resp.ok) {
                statusEl.innerText = "NETWORK: CONNECTED (GATE ACTIVE)";
                statusEl.style.color = "var(--c4)";
            } else {
                statusEl.innerText = "NETWORK: DISSONANCE (404/500)";
                statusEl.style.color = "var(--scarlet)";
            }
        } catch (e) {
            statusEl.innerText = "NETWORK: DISCONNECTED (OFFLINE)";
            statusEl.style.color = "var(--scarlet)";
        }
    },

    checkDatabase: function() {
        const dbEl = document.getElementById('vault-db-status');
        if (!dbEl) return;
        dbEl.innerText = "DATABASE: LOCAL SUBSTRATE ACTIVE";
        dbEl.style.color = "var(--blue)";
    },

    renderDynamics: function() {
        const dynamicsEl = document.getElementById('vault-dynamics-controls');
        if (!dynamicsEl) return;

        dynamicsEl.innerHTML = '';
        
        const scaleBtn = document.createElement('button');
        scaleBtn.style.width = "100%";
        scaleBtn.style.background = "transparent";
        scaleBtn.style.border = "1px solid var(--border)";
        scaleBtn.style.color = "var(--text)";
        scaleBtn.style.padding = "8px";
        scaleBtn.style.cursor = "pointer";
        scaleBtn.style.fontSize = "0.7rem";
        
        scaleBtn.innerText = `UI SCALE: ${state.uiScale.toFixed(1)}`;
        scaleBtn.onclick = () => {
            toggleUIScale();
            scaleBtn.innerText = `UI SCALE: ${state.uiScale.toFixed(1)}`;
        };
        
        dynamicsEl.appendChild(scaleBtn);
    }
};
