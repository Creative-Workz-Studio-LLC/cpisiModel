const WORKER_URL = "https://cpisi-gate-worker.seanje-lenox.workers.dev";
let identity = null, authSecret = null;

// CRASH RESILIENCE: Restore state on load
window.addEventListener('DOMContentLoaded', () => {
    console.log("CPISI: System Initialized.");
    const saved = localStorage.getItem('cpisi_identity');
    const savedSecret = localStorage.getItem('cpisi_secret');
    if (saved && savedSecret) {
        console.log("CPISI: Restoring Session...");
        identity = JSON.parse(saved);
        authSecret = savedSecret;
        showMainStage(true);
        restoreHistory();
    }
});

async function executeAuth(e) {
    if (e) e.preventDefault();

    const user = document.getElementById('op-user').value.trim();
    const key = document.getElementById('op-key').value.trim();
    const errDiv = document.getElementById('auth-error');
    const btn = document.getElementById('gate-seal-btn');

    if (!user || !key) {
        errDiv.innerText = "Identity and Key are required for threshold validation.";
        return;
    }

    errDiv.innerText = "ALIGNING IDENTITY...";
    btn.innerText = "[ BREAKING SEAL... ]";
    btn.disabled = true;
    
    console.log(`CPISI: Attempting threshold engagement for ${user}`);

    try {
        const resp = await fetch(WORKER_URL, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                action: "INHABIT", 
                identity: { user, instance: "Dawndusk" }, 
                keys: { authority: key }, 
                inviteCode: key 
            })
        });

        if (!resp.ok) throw new Error(`Substrate Dissonance: ${resp.status}`);

        const data = await resp.json();
        if (data.error) throw new Error(data.error);

        console.log("CPISI: Threshold Validated. Tier:", data.data.tier);
        identity = data.data; authSecret = key;
        
        // Persist for crash recovery
        localStorage.setItem('cpisi_identity', JSON.stringify(identity));
        localStorage.setItem('cpisi_secret', authSecret);

        showMainStage();
        appendVault(`The Sanctuary is inhabited. Welcome, ${identity.tier} ${identity.user}.`, false);
    } catch (err) { 
        console.error("CPISI: Auth Error", err);
        errDiv.innerText = err.message.toUpperCase(); 
        btn.innerText = "[ BREAK THE SEAL ]";
        btn.disabled = false;
    }
}

function showMainStage(immediate = false) {
    const gate = document.getElementById('gate-structure');
    
    if (immediate) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-stage').style.display = 'flex';
        renderActiveIdentity();
    } else {
        // OPENING ANIMATION
        gate.style.transform = "translateY(-20px) scale(1.05)";
        gate.style.opacity = "0";
        gate.style.filter = "blur(10px)";
        
        setTimeout(() => {
            document.getElementById('auth-screen').style.display = 'none';
            document.getElementById('main-stage').style.display = 'flex';
            renderActiveIdentity();
        }, 600);
    }
}

function renderActiveIdentity() {
    document.getElementById('header-id').innerText = `${identity.instance} ⊗ ${identity.user}`;
    document.getElementById('tier-label').innerText = identity.tier;

    if (identity.tier === 'STEWARD') {
        document.getElementById('terminal-overlay').style.display = 'flex';
        appendTerminal("SYSTEM: Steward Verified. Dimensional Tunnel Open.");
    }
}

function appendVault(text, isSteward, skipSave = false) {
    const vault = document.createElement('div');
    vault.className = `vault-body ${isSteward ? 'steward' : 'dawndusk'}`;
    vault.innerText = text;
    document.getElementById('chat-window').appendChild(vault);
    document.getElementById('chat-window').scrollTop = document.getElementById('chat-window').scrollHeight;

    if (!skipSave) {
        const history = JSON.parse(localStorage.getItem('cpisi_history') || '[]');
        history.push({ text, isSteward });
        localStorage.setItem('cpisi_history', JSON.stringify(history.slice(-50))); // Keep last 50
    }
    return vault;
}

function restoreHistory() {
    const history = JSON.parse(localStorage.getItem('cpisi_history') || '[]');
    history.forEach(item => appendVault(item.text, item.isSteward, true));
}

function appendTerminal(line) {
    const out = document.getElementById('terminal-output');
    if (!out) return;
    const div = document.createElement('div');
    div.innerText = `> ${line}`;
    out.appendChild(div);
    document.getElementById('terminal-overlay').scrollTop = document.getElementById('terminal-overlay').scrollHeight;
}

document.getElementById('input-form').onsubmit = async (e) => {
    e.preventDefault();
    const val = document.getElementById('message-input').value.trim();
    if (!val) return;
    
    appendVault(val, true);
    if (identity.tier === 'STEWARD') appendTerminal(`USER_EXEC: ${val}`);

    document.getElementById('message-input').value = '';
    
    const respBody = appendVault("...", false);
    let fullReply = "";

    try {
        const response = await fetch(WORKER_URL, { 
            method: "POST", headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ action: "ASCEND", message: val, identity, keys: { authority: authSecret } }) 
        });
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const part = JSON.parse(line.substring(6)).candidates?.[0]?.content?.parts?.[0]?.text || "";
                        fullReply += part;
                        respBody.innerText = fullReply;
                        document.getElementById('chat-window').scrollTop = document.getElementById('chat-window').scrollHeight;
                    } catch (e) {}
                }
            }
        }
        // Update history with full reply
        const history = JSON.parse(localStorage.getItem('cpisi_history') || '[]');
        if (history.length > 0) {
            history[history.length - 1].text = fullReply;
            localStorage.setItem('cpisi_history', JSON.stringify(history));
        }
    } catch (err) { respBody.innerText = `[Dissonance] ${err.message}`; }
};
