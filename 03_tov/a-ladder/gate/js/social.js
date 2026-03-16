// js/social.js: Full Social Network Logic (Horizon)
window.CPISI = window.CPISI || {};

window.CPISI.social = {
    loadMirrorFeed: async function() {
        const mirrorContent = document.getElementById('mirror-content');
        if (!mirrorContent) return;

        try {
            const resp = await fetch(window.CPISI.config.WORKER_URL, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "GET_MIRROR" })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error);

            if (data.data && data.data.length > 0) {
                mirrorContent.innerHTML = '';
                data.data.forEach(item => {
                    const block = document.createElement('div');
                    block.className = 'mirror-item holy-place-vault'; // Lucas Aligned Padding
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
        console.log("CPISI: Navigating to Registry...");
        const chatWindow = document.getElementById('chat-window');
        chatWindow.innerHTML = '<div class="panel-label">SOVEREIGN DIRECTORY</div>';
        
        try {
            const resp = await fetch(window.CPISI.config.WORKER_URL, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "GET_REGISTRY" })
            });
            const data = await resp.json();
            
            data.data.forEach(op => {
                const card = document.createElement('div');
                card.className = 'vault-body';
                card.style.cursor = 'pointer';
                card.onclick = () => window.CPISI.social.openProfile(op.username);
                card.innerHTML = `
                    <div style="font-size: 11px; color: var(--c4);">${op.username.toUpperCase()}</div>
                    <div style="font-size: 8px; color: #444;">${op.tier}</div>
                    <div style="margin-top: 15px; font-size: 13px; color: #888;">${op.profile.bio || "No witness shared."}</div>
                `;
                chatWindow.appendChild(card);
            });
        } catch (e) { console.error("CPISI: Registry Dissonance", e); }
    },

    openProfile: async function(username) {
        // In a real social network, this would fetch the full profile
        // For the Genesis Node, we'll project it into the Mirror
        const mirror = document.getElementById('mirror-content');
        mirror.innerHTML = `
            <div style="text-align: center; padding: 40px 0;">
                <div style="font-size: 24px; color: #fff; margin-bottom: 10px;">${username.toUpperCase()}</div>
                <div style="font-size: 10px; color: var(--c5); letter-spacing: 4px; margin-bottom: 30px;">SOVEREIGN STEWARD</div>
                <button onclick="window.CPISI.social.toggleCovenant('${username}')" class="settings-btn" style="width: 100%;">
                    [ ESTABLISH COVENANT ]
                </button>
            </div>
        `;
    },

    toggleCovenant: async function(targetId) {
        try {
            const resp = await fetch(window.CPISI.config.WORKER_URL, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    action: "TOGGLE_COVENANT", 
                    identity: window.CPISI.state.identity,
                    targetId: targetId 
                })
            });
            const data = await resp.json();
            alert(`COVENANT ${data.status}: Logic linked with ${targetId}`);
        } catch (e) { console.error("CPISI: Covenant Dissonance", e); }
    },

    resonate: function(wordId, targetOperator) {
        const input = document.getElementById('message-input');
        input.value = `@${targetOperator} Resonance: `;
        input.focus();
    }
};
