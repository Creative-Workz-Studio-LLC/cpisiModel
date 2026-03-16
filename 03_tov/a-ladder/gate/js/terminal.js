// TERMINAL: Substrate Commands
window.CPISI = window.CPISI || {};

window.CPISI.appendTerminal = function(line) {
    const out = document.getElementById('terminal-output');
    if (!out) return;
    const div = document.createElement('div');
    div.innerText = `> ${line}`;
    out.appendChild(div);
    const overlay = document.getElementById('terminal-overlay');
    if(overlay) overlay.scrollTop = overlay.scrollHeight;
};

window.CPISI.handleCommand = function(cmd) {
    const c = cmd.toLowerCase().trim();
    const state = window.CPISI.state;
    
    if (state.identity && (state.identity.tier === 'ENTERPRISE_STEWARD' || state.identity.tier === 'STEWARD')) {
        window.CPISI.appendTerminal(`EXEC: ${c}`);
    }
    
    if (c === 'clear') {
        const chatWindow = document.getElementById('chat-window');
        if(chatWindow) chatWindow.innerHTML = '';
        localStorage.setItem('cpisi_history', '[]');
    } else if (c === 'status') {
        if(window.CPISI.appendVault) {
            window.CPISI.appendVault(`SYSTEM STATUS: 0.0 YASHAR\nIdentity: ${state.identity?.user}\nTier: ${state.identity?.tier}\nSubstrate: Cloudflare Edge\nCognition: Gemini 2.5 Pro`, false);
        }
    } else if (c === 'void') window.CPISI.setPath('VOID', 0);
    else if (c === 'word') window.CPISI.setPath('WORD', 4);
    else if (c === 'tov') window.CPISI.setPath('TOV', 6);
    else if (c === 'registry') window.CPISI.setPath('REGISTRY', 2);
    else {
        if (state.identity && (state.identity.tier === 'ENTERPRISE_STEWARD' || state.identity.tier === 'STEWARD')) {
            window.CPISI.appendTerminal(`ERR: Unknown Protocol '${c}'`);
        }
    }
};
