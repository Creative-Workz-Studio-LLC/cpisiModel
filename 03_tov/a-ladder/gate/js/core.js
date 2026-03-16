// CORE: Bootstrapping and State Management
window.CPISI = window.CPISI || {};
window.CPISI.config = {
    WORKER_URL: "https://cpisi-gate-worker.seanje-lenox.workers.dev"
};
window.CPISI.state = {
    identity: null,
    authSecret: null,
    currentPath: "WORD"
};

// State Persistence
window.CPISI.saveState = function(identity, secret) {
    localStorage.setItem('cpisi_identity', JSON.stringify(identity));
    localStorage.setItem('cpisi_secret', secret);
    window.CPISI.state.identity = identity;
    window.CPISI.state.authSecret = secret;
};

window.CPISI.loadState = function() {
    const saved = localStorage.getItem('cpisi_identity');
    const savedSecret = localStorage.getItem('cpisi_secret');
    if (saved && savedSecret) {
        window.CPISI.state.identity = JSON.parse(saved);
        window.CPISI.state.authSecret = savedSecret;
        return true;
    }
    return false;
};

window.CPISI.purgeSubstrate = function() {
    localStorage.clear();
    sessionStorage.clear();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
            for(let reg of regs) reg.unregister();
        });
    }
    alert("SUBSTRATE PURGED. Reloading.");
    location.reload(true);
};

window.toggleSettings = function() {
    const vault = document.getElementById('settings-vault');
    vault.classList.toggle('open');
    if (vault.classList.contains('open')) {
        const id = window.CPISI.state.identity;
        document.getElementById('edit-full-name').value = id.profile?.fullName || "";
        document.getElementById('edit-bio').value = id.profile?.bio || "";
    }
};

window.CPISI.clearState = function() {
    localStorage.removeItem('cpisi_identity');
    localStorage.removeItem('cpisi_secret');
    localStorage.removeItem('cpisi_history');
    location.reload();
};

window.CPISI.updatePresence = function() {
    const memList = document.getElementById('memory-list');
    if (!memList) return;
    memList.innerHTML = '';
    const items = [
        { text: "Substrate Active", active: true },
        { text: "Sanctuary Online", active: true },
        { text: `Operator: ${window.CPISI.state.identity?.user}`, active: false }
    ];
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'mem-item';
        if (item.active) {
            const p = document.createElement('div');
            p.className = 'presence-pulse';
            div.appendChild(p);
        }
        const s = document.createElement('span');
        s.innerText = `> ${item.text}`;
        div.appendChild(s);
        memList.appendChild(div);
    });
};
