import { SanctuaryState, Identity } from "../types/index.ts";

export const state: SanctuaryState = {
    identity: null,
    authSecret: null,
    currentPath: "WORD",
    uiScale: 1.0
};

export const saveState = (identity: Identity, secret: string) => {
    localStorage.setItem('cpisi_identity', JSON.stringify(identity));
    localStorage.setItem('cpisi_secret', secret);
    state.identity = identity;
    state.authSecret = secret;
};

export const loadState = (): boolean => {
    const saved = localStorage.getItem('cpisi_identity');
    const savedSecret = localStorage.getItem('cpisi_secret');
    const savedScale = localStorage.getItem('cpisi_ui_scale') || "1.0";

    document.documentElement.style.setProperty('--ui-scale', savedScale);
    state.uiScale = parseFloat(savedScale);

    if (saved && savedSecret) {
        state.identity = JSON.parse(saved);
        state.authSecret = savedSecret;
        return true;
    }
    return false;
};

export const clearState = () => {
    localStorage.removeItem('cpisi_identity');
    localStorage.removeItem('cpisi_secret');
    localStorage.removeItem('cpisi_history');
    location.reload();
};

export const purgeSubstrate = () => {
    localStorage.clear();
    sessionStorage.clear();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
            for(let reg of regs) reg.unregister();
        });
    }
    alert("SUBSTRATE PURGED. Reloading.");
    location.reload();
};
