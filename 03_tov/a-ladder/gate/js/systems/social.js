// SOCIAL: Full Covenant Network Logic
window.CPISI = window.CPISI || {};

window.CPISI.social = {
    loadMirrorFeed: async function() {
        const mirrorContent = document.getElementById('mirror-content');
        if (!mirrorContent) return;
        try {
            const resp = await fetch(window.CPISI.config.WORKER_URL, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    action: "GET_MIRROR", 
                    identity: window.CPISI.state.identity,
                    inviteCode: window.CPISI.state.authSecret 
                })
            });
            const data = await resp.json();
            if (data.data) {
                mirrorContent.innerHTML = '';
                data.data.forEach(item => {
                    const block = document.createElement('div');
                    block.className = 'mirror-item';
                    block.innerHTML = `
                        <div style="font-size: 0.7rem; color: var(--gold); letter-spacing: 2px; margin-bottom: 8px;">
                            ${item.operator.toUpperCase()} // ${item.tier}
                        </div>
                        <div style="color: #888; line-height: 1.6; font-size: 0.9rem;">${item.content}</div>
                    `;
                    mirrorContent.appendChild(block);
                });
            }
        } catch (e) { console.error("CPISI: Mirror Dissonance", e); }
    },

    loadRegistry: async function() {
        const grid = document.getElementById('registry-grid');
        if (!grid) return;
        grid.innerHTML = '<div style="color:#222; font-family:var(--mono); font-size:0.8rem;">SYNCING...</div>';
        try {
            const resp = await fetch(window.CPISI.config.WORKER_URL, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "GET_REGISTRY" })
            });
            const data = await resp.json();
            grid.innerHTML = '';
            data.data.forEach(op => {
                const card = document.createElement('div');
                card.className = 'operator-card';
                card.innerHTML = `
                    <div style="font-size: 1rem; color: var(--gold); letter-spacing: 2px;">${op.username.toUpperCase()}</div>
                    <div style="font-size: 0.7rem; color: #444; margin-bottom: 11px;">${op.tier}</div>
                    <div style="font-size: 0.9rem; color: #888; line-height: 1.4;">${op.profile.bio || "No witness shared."}</div>
                `;
                grid.appendChild(card);
            });
        } catch (e) { console.error("CPISI: Registry Dissonance", e); }
    },

    updateProfile: async function() {
        const fullName = document.getElementById('edit-full-name').value.trim();
        const bio = document.getElementById('edit-bio').value.trim();
        try {
            const resp = await fetch(window.CPISI.config.WORKER_URL, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "UPDATE_PROFILE",
                    identity: window.CPISI.state.identity,
                    inviteCode: window.CPISI.state.authSecret,
                    updates: { fullName, bio }
                })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error);
            window.CPISI.state.identity.profile = { fullName, bio };
            window.CPISI.saveState(window.CPISI.state.identity, window.CPISI.state.authSecret);
            alert("PROFILE UPDATED");
            window.toggleSettings();
        } catch (e) { alert("Dissonance: " + e.message); }
    }
};
