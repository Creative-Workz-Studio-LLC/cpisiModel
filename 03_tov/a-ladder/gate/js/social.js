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
            if (data.error) throw new Error(data.error);

            if (data.data) {
                mirrorContent.innerHTML = '';
                data.data.forEach(item => {
                    const block = document.createElement('div');
                    block.className = 'mirror-item holy-place-vault';
                    block.innerHTML = `
                        <div style="font-size: 9px; color: var(--c4); letter-spacing: 2px; margin-bottom: 8px; cursor:pointer;" 
                             onclick="window.CPISI.social.openProfile('${item.operator}')">
                            ${item.operator.toUpperCase()} // ${item.tier}
                        </div>
                        <div style="color: #aaa; line-height: 1.6; font-size: 13px;">${item.content}</div>
                        <button onclick="window.CPISI.social.resonate('${item.id}', '${item.operator}')" 
                                style="background:transparent; border:none; color:#222; font-family:var(--mono); font-size:8px; cursor:pointer; margin-top:10px;">
                            [ RESONATE ]
                        </button>
                    `;
                    mirrorContent.appendChild(block);
                });
            }
        } catch (e) { console.error("CPISI: Mirror Feed Dissonance", e); }
    },

    loadRegistry: async function() {
        const grid = document.getElementById('registry-grid');
        if (!grid) return;
        grid.innerHTML = '<div style="color:#222; font-family:var(--mono); font-size:9px;">SYNCING DIRECTORY...</div>';
        
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
                card.onclick = () => window.CPISI.social.openProfile(op.username);
                card.innerHTML = `
                    <div style="font-size: 11px; color: var(--c4); letter-spacing: 2px;">${op.username.toUpperCase()}</div>
                    <div style="font-size: 8px; color: #444; margin-bottom: 10px;">${op.tier}</div>
                    <div style="font-size: 12px; color: #888; line-height: 1.4;">${op.profile.bio || "No witness shared."}</div>
                `;
                grid.appendChild(card);
            });
        } catch (e) { console.error("CPISI: Registry Dissonance", e); }
    },

    openProfile: async function(username) {
        window.setPath('PROFILE', 5);
        const vault = document.getElementById('profile-vault');
        vault.innerHTML = '<div style="color:#222; font-family:var(--mono); font-size:9px;">OPENING VAULT...</div>';

        try {
            const resp = await fetch(window.CPISI.config.WORKER_URL, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "GET_REGISTRY" }) // Search registry for this user
            });
            const data = await resp.json();
            const user = data.data.find(u => u.username.toLowerCase() === username.toLowerCase());
            
            if (user) {
                vault.innerHTML = `
                    <div style="border-bottom: 1px solid #111; padding-bottom: 40px;">
                        <div style="font-size: 32px; color: #fff; margin-bottom: 10px; letter-spacing: 4px;">${user.username.toUpperCase()}</div>
                        <div style="font-size: 10px; color: var(--c5); letter-spacing: 4px;">${user.tier}</div>
                    </div>
                    <div style="padding: 40px 0; color: #aaa; font-size: 18px; line-height: 1.8;">
                        ${user.profile.bio || "This Steward has not yet manifested a public witness."}
                    </div>
                    <button onclick="window.CPISI.social.toggleCovenant('${user.username}')" class="btn-activate" style="width: 300px;">
                        [ ESTABLISH COVENANT ]
                    </button>
                `;
            }
        } catch (e) { console.error("CPISI: Profile Dissonance", e); }
    },

    toggleCovenant: async function(targetId) {
        try {
            const resp = await fetch(window.CPISI.config.WORKER_URL, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    action: "TOGGLE_COVENANT", 
                    identity: window.CPISI.state.identity,
                    inviteCode: window.CPISI.state.authSecret,
                    targetId: targetId 
                })
            });
            const data = await resp.json();
            alert(`COVENANT ${data.status}: Logic linked with ${targetId}`);
            this.loadMirrorFeed(); // Refresh feed to show their words
        } catch (e) { console.error("CPISI: Covenant Dissonance", e); }
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
            
            // Update local state
            window.CPISI.state.identity.profile.fullName = fullName;
            window.CPISI.state.identity.profile.bio = bio;
            window.CPISI.saveState(window.CPISI.state.identity, window.CPISI.state.authSecret);
            
            alert("SOVEREIGN PROFILE UPDATED");
            window.toggleSettings(); // Close panel
        } catch (e) { alert("Dissonance: " + e.message); }
    },

    resonate: function(wordId, targetOperator) {
        window.setPath('WORD', 4);
        const input = document.getElementById('message-input');
        input.value = `@${targetOperator} Resonance: `;
        input.focus();
    }
};
