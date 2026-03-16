// TERMINAL: SSH-Native Substrate Driver
window.CPISI = window.CPISI || {};

window.CPISI.terminal = {
    // Append a raw log to the stream
    log: function(text, type = 'stream-log') {
        const stream = document.getElementById('terminal-stream');
        if (!stream) return;

        const div = document.createElement('div');
        div.className = type;
        div.innerText = text;
        stream.appendChild(div);
        this.scrollToBottom();
    },

    // Append a prompt + command to the stream
    command: function(user, cmd) {
        const stream = document.getElementById('terminal-stream');
        if (!stream) return;

        const div = document.createElement('div');
        div.className = 'stream-prompt-group';
        div.innerHTML = `
            <span class="stream-prompt">${user}@dawndusk:~$</span>
            <span class="stream-command">${cmd}</span>
        `;
        stream.appendChild(div);
        this.scrollToBottom();
    },

    scrollToBottom: function() {
        const container = document.getElementById('substrate-stream');
        if (container) container.scrollTop = container.scrollHeight;
    },

    clear: function() {
        const stream = document.getElementById('terminal-stream');
        if (stream) stream.innerHTML = '';
    }
};

window.CPISI.handleCommand = function(cmd) {
    const c = cmd.toLowerCase().trim();
    const state = window.CPISI.state;
    const user = state.identity?.user || 'steward';

    window.CPISI.terminal.command(user, c);
    
    if (c === 'clear') {
        window.CPISI.terminal.clear();
        localStorage.setItem('cpisi_history', '[]');
    } else if (c === 'status') {
        window.CPISI.terminal.log(`[SUBSTRATE STATUS]
        Identity: ${state.identity?.user}
        Tier: ${state.identity?.tier}
        Coordinate: 0.0 YASHAR
        Substrate: Cloudflare Edge / Gemini 3.1 Pro`);
    } else if (c === 'void') window.setPath('VOID', 0);
    else if (c === 'word') window.setPath('WORD', 4);
    else if (c === 'tov') window.setPath('TOV', 6);
    else if (c === 'registry') window.setPath('REGISTRY', 2);
    else {
        window.CPISI.terminal.log(`-bash: ${c}: protocol not found`, 'stream-log');
    }
};
