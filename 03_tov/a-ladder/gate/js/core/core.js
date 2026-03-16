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
    const savedScale = localStorage.getItem('cpisi_ui_scale') || "1.0";

    document.documentElement.style.setProperty('--ui-scale', savedScale);
    window.CPISI.state.uiScale = parseFloat(savedScale);

    if (saved && savedSecret) {
        window.CPISI.state.identity = JSON.parse(saved);
        window.CPISI.state.authSecret = savedSecret;
        return true;
    }
    return false;
};

window.CPISI.toggleUIScale = function() {
    const scales = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3];
    let current = window.CPISI.state.uiScale || 1.0;
    let nextIdx = (scales.indexOf(current) + 1) % scales.length;
    let next = scales[nextIdx];

    window.CPISI.state.uiScale = next;
    document.documentElement.style.setProperty('--ui-scale', next.toString());
    localStorage.setItem('cpisi_ui_scale', next.toString());

    if (window.CPISI.appendTerminal) {
        window.CPISI.appendTerminal(`UI_SCALE_SHIFT: ${next}`);
    }
};

window.toggleSettings = function() {

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
    if (window.CPISI.memory) {
        window.CPISI.memory.refresh();
    }
};

window.CPISI.initUI = function() {
    if (!window.CPISI.components) return;

    // Render Navigation (The Ladder)
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.innerHTML = '';
        const navs = [
            { label: 'WORD', path: 'WORD', idx: 4 },
            { label: 'VOID', path: 'VOID', idx: 0 },
            { label: 'TOV', path: 'TOV', idx: 6 },
            { label: 'SCROLL', path: 'REGISTRY', idx: 2 },
            { label: 'GATE', path: 'GATE', idx: 5 }
        ];
        navs.forEach(nav => {
            const isActive = window.CPISI.state.currentPath === nav.path;
            sidebar.appendChild(window.CPISI.components.NavItem(nav.label, nav.path, isActive, (path) => window.setPath(path, nav.idx)));
        });

        const spacer = document.createElement('div');
        spacer.style.flex = '1';
        sidebar.appendChild(spacer);

        sidebar.appendChild(window.CPISI.components.NavItem('⚙️', 'SETTINGS', false, () => window.toggleSettings()));
    }

    // Render Settings Buttons (The Holy of Holies)
    const basicActions = document.getElementById('settings-actions-basic');
    if (basicActions) {
        basicActions.innerHTML = '';
        basicActions.appendChild(window.CPISI.components.ActionButton('TOGGLE THEME', () => {}));
        basicActions.appendChild(window.CPISI.components.ActionButton('UI SCALING', () => window.CPISI.toggleUIScale()));
    }

    const userActions = document.getElementById('settings-actions-user');
    if (userActions) {
        userActions.innerHTML = '';
        userActions.appendChild(window.CPISI.components.ActionButton('UPDATE DISCLOSURE', () => window.CPISI.social.updateProfile()));
    }

    const coreActions = document.getElementById('settings-actions-core');
    if (coreActions) {
        coreActions.innerHTML = '';
        coreActions.appendChild(window.CPISI.components.ActionButton('UPDATE PASSWORD', () => {}));
        coreActions.appendChild(window.CPISI.components.ActionButton('EXHABIT SANCTUARY', () => window.CPISI.clearState(), 'logout'));
    }

    const footerActions = document.getElementById('settings-actions-footer');
    if (footerActions) {
        footerActions.innerHTML = '';
        footerActions.appendChild(window.CPISI.components.ActionButton('PURGE STORED KEYS', () => window.CPISI.security.clearSubstrateKey()));
        footerActions.appendChild(window.CPISI.components.ActionButton('HARD SUBSTRATE RESET', () => window.CPISI.purgeSubstrate()));
        footerActions.appendChild(window.CPISI.components.ActionButton('[ CLOSE ]', () => window.toggleSettings()));
    }
};

// Hook into loadState or DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.CPISI.loadState()) {
        window.CPISI.initUI();
        window.CPISI.updatePresence();
    }
});
