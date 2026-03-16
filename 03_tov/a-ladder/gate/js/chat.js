// CHAT: The Holy Place and Persistent Word
window.CPISI = window.CPISI || {};

window.CPISI.appendVault = function(text, isSteward, skipSave = false) {
    const vault = document.createElement('div');
    vault.className = `vault-body ${isSteward ? 'steward' : 'dawndusk'}`;
    
    // THE SEAL TRIGGER
    const seal = document.createElement('div');
    seal.className = 'vault-seal';
    seal.innerText = '✧';
    seal.title = 'Seal to Mirror';
    seal.onclick = () => window.CPISI.sealWord(text, vault);
    vault.appendChild(seal);

    // THE CONTENT CONTAINER (Explicit targeting)
    const content = document.createElement('div');
    content.className = 'vault-content';
    content.innerText = text;
    vault.appendChild(content);
    
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
        chatWindow.appendChild(vault);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    if (!skipSave) {
        const history = JSON.parse(localStorage.getItem('cpisi_history') || '[]');
        history.push({ text, isSteward });
        localStorage.setItem('cpisi_history', JSON.stringify(history.slice(-50)));
    }
    return vault;
};

window.CPISI.sealWord = async function(text, element) {
    element.classList.add('projecting');
    const mirror = document.getElementById('mirror-content');
    
    mirror.innerText = text;
    mirror.classList.add('active');
    setTimeout(() => element.classList.remove('projecting'), 600);

    try {
        await fetch(window.CPISI.config.WORKER_URL, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "PUBLISH_TOV",
                identity: window.CPISI.state.identity,
                inviteCode: window.CPISI.state.authSecret,
                vaultBlock: text
            })
        });
        if (window.CPISI.social) window.CPISI.social.loadMirrorFeed();
    } catch (e) { console.error("CPISI: Mirror Dissonance", e); }
};

window.CPISI.restoreHistory = async function() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML = '';
    
    try {
        const resp = await fetch(window.CPISI.config.WORKER_URL, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "GET_HISTORY",
                identity: window.CPISI.state.identity,
                inviteCode: window.CPISI.state.authSecret
            })
        });
        const data = await resp.json();
        if (data.data && data.data.length > 0) {
            data.data.forEach(item => {
                window.CPISI.appendVault(item.text, item.isSteward, true);
            });
        } else {
            const history = JSON.parse(localStorage.getItem('cpisi_history') || '[]');
            history.forEach(item => window.CPISI.appendVault(item.text, item.isSteward, true));
        }
    } catch (e) { console.error("CPISI: History Sync Dissonance", e); }
};

window.CPISI.handleMessageSubmit = async function(e) {
    e.preventDefault();
    const inputEl = document.getElementById('message-input');
    const val = inputEl.value.trim();
    if (!val) return;
    
    if (val.startsWith('/') && window.CPISI.handleCommand) {
        window.CPISI.handleCommand(val.substring(1));
        inputEl.value = '';
        return;
    }

    window.CPISI.appendVault(val, true);
    inputEl.value = '';
    
    // Create response block with loading state
    const respVault = window.CPISI.appendVault("...", false);
    const respContent = respVault.querySelector('.vault-content');
    respContent.classList.add('thinking');
    let fullReply = "";

    try {
        const payload = { 
            action: "ASCEND", message: val, 
            identity: window.CPISI.state.identity, 
            keys: { authority: window.CPISI.state.authSecret } 
        };
        const substrateKey = window.CPISI.security.getSubstrateKey();
        if (substrateKey) payload.keys.gemini = substrateKey;

        const response = await fetch(window.CPISI.config.WORKER_URL, { 
            method: "POST", headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(payload) 
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
                        const json = JSON.parse(line.substring(6));
                        const part = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
                        
                        if (part) {
                            if (fullReply === "") {
                                respContent.innerText = ""; // Clear "..." on first real data
                                respContent.classList.remove('thinking');
                            }
                            fullReply += part;
                            respContent.innerText = fullReply;
                            const chatWindow = document.getElementById('chat-window');
                            if(chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
                        }
                    } catch (e) {}
                }
            }
        }
    } catch (err) { 
        respContent.classList.remove('thinking');
        respContent.innerText = `[Dissonance] ${err.message}`; 
    }
};

window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('input-form');
    if (form) form.onsubmit = window.CPISI.handleMessageSubmit;
    
    if (window.CPISI.loadState()) {
        window.CPISI.showMainStage(true);
        window.CPISI.restoreHistory();
        window.CPISI.updatePresence();
        if(window.CPISI.setPath) {
            window.CPISI.setPath(localStorage.getItem('cpisi_path') || 'WORD', localStorage.getItem('cpisi_path_idx') || 4);
        }
    }
});
