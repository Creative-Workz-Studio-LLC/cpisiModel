// CHAT: The Visual Parser for the Substrate Stream
window.CPISI = window.CPISI || {};

window.CPISI.appendVault = function(text, isSteward, skipSave = false) {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow || !window.CPISI.components) return;

    const vault = window.CPISI.components.VaultMessage(
        text, 
        isSteward, 
        text === "...", 
        (txt, el) => window.CPISI.sealWord ? window.CPISI.sealWord(txt, el) : null
    );
    
    chatWindow.appendChild(vault);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    if (!skipSave) {
        const history = JSON.parse(localStorage.getItem('cpisi_history') || '[]');
        history.push({ text, isSteward });
        localStorage.setItem('cpisi_history', JSON.stringify(history.slice(-50)));
    }
    return vault;
};

window.CPISI.handleMessageSubmit = async function(e) {
    e.preventDefault();
    const inputEl = document.getElementById('message-input');
    const val = inputEl.value.trim();
    if (!val) return;
    
    const user = window.CPISI.state.identity?.user || 'steward';

    // 1. User Message (Revelation)
    window.CPISI.appendVault(val, true);
    inputEl.value = '';
    
    // 2. Thinking State (Separate Block)
    const thinkingVault = window.CPISI.appendVault("...", false, true);
    const thinkingContent = thinkingVault.querySelector('.vault-content');
    thinkingContent.classList.add('thinking');
    
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
        let buffer = "";
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            let lines = buffer.split('\n');
            buffer = lines.pop();
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const json = JSON.parse(line.substring(6));
                        const part = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
                        if (part) {
                            if (fullReply === "") {
                                // Transition from Thinking to Response
                                thinkingContent.innerText = "";
                                thinkingContent.classList.remove('thinking');
                            }
                            fullReply += part;
                            thinkingContent.innerText = fullReply;
                            document.getElementById('chat-window').scrollTop = document.getElementById('chat-window').scrollHeight;
                        }
                    } catch (e) {}
                }
            }
        }
        
        // Final Save to History
        const history = JSON.parse(localStorage.getItem('cpisi_history') || '[]');
        history.push({ text: fullReply, isSteward: false });
        localStorage.setItem('cpisi_history', JSON.stringify(history.slice(-50)));

    } catch (err) { 
        thinkingContent.classList.remove('thinking');
        thinkingContent.innerText = `[Dissonance] ${err.message}`; 
    }
};

window.CPISI.restoreHistory = async function() {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return;
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

window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('input-form');
    if (form) form.onsubmit = window.CPISI.handleMessageSubmit;
    
    if (window.CPISI.loadState()) {
        window.CPISI.showMainStage(true);
        window.CPISI.restoreHistory();
        window.CPISI.updatePresence();
    }
});
