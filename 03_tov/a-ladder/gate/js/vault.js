// VAULT: The Holy of Holies (Control Center for Connections & Dynamics)
window.CPISI = window.CPISI || {};
window.CPISI.vault = {
    
    /**
     * Initialize the Vault state and UI
     */
    init: function() {
        this.checkNetwork();
        this.checkDatabase();
        this.renderDynamics();
    },

    /**
     * Check the health of the Cloudflare Worker (The Bridge)
     */
    checkNetwork: async function() {
        const statusEl = document.getElementById('vault-network-status');
        if (!statusEl) return;

        statusEl.innerText = "NETWORK: PINGING...";
        try {
            const resp = await fetch(`${window.CPISI.config.WORKER_URL}/health`, { method: 'GET' });
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

    /**
     * Check local database status (Placeholder for SQL logic)
     */
    checkDatabase: function() {
        const dbEl = document.getElementById('vault-db-status');
        if (!dbEl) return;
        
        // In the future, this will handshake with the Go sync-client
        dbEl.innerText = "DATABASE: LOCAL SUBSTRATE ACTIVE";
        dbEl.style.color = "var(--blue)";
    },

    /**
     * Render the UI Scaling and Luminance controls
     */
    renderDynamics: function() {
        const dynamicsEl = document.getElementById('vault-dynamics-controls');
        if (!dynamicsEl) return;

        dynamicsEl.innerHTML = '';
        
        // UI Scale Button
        const scaleBtn = document.createElement('button');
        scaleBtn.className = 'placeholder-box'; // Placeholder style for now
        scaleBtn.style.width = "100%";
        scaleBtn.innerText = `UI SCALE: ${window.CPISI.state.uiScale || '1.0'}`;
        scaleBtn.onclick = () => {
            window.CPISI.toggleUIScale();
            scaleBtn.innerText = `UI SCALE: ${window.CPISI.state.uiScale}`;
        };
        
        dynamicsEl.appendChild(scaleBtn);
    }
};
