/**
 * UI LOGIC: Orchestrating the Sanctuary Grid
 */
import { state } from "./state.ts";
import { NavItem } from "../components/ui.ts";
import { Vault } from "../screens/vault.ts";

export const initUI = () => {
    // Hide all overlays and show main stage
    const landing = document.getElementById('landing-screen');
    const auth = document.getElementById('auth-screen');
    const sanctuary = document.getElementById('sanctuary-root');
    
    if (landing) landing.style.display = 'none';
    if (auth) auth.style.display = 'none';
    if (sanctuary) sanctuary.style.display = 'grid';

    // Update Header
    const userEl = document.getElementById('header-user');
    if (userEl) userEl.innerText = state.identity?.user || "...";

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
            const isActive = state.currentPath === nav.path;
            sidebar.appendChild(NavItem(nav.label, nav.path, isActive, (path) => {
                state.currentPath = path;
                initUI(); // Re-render sidebar to update active state
            }));
        });

        // Settings Trigger
        const settingsBtn = NavItem('⚙️', 'SETTINGS', false, () => Vault.toggle());
        settingsBtn.classList.add('settings-trigger');
        sidebar.appendChild(settingsBtn);
    }

    // Render Vault Actuators if Vault is open
    Vault.renderDynamics();
};

export const enterThreshold = () => {
    const landing = document.getElementById('landing-screen');
    const auth = document.getElementById('auth-screen');
    if (landing) landing.style.display = 'none';
    if (auth) auth.style.display = 'flex';
};

export const toggleUIScale = () => {
    const scales = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3];
    let current = state.uiScale || 1.0;
    let nextIdx = (scales.indexOf(current) + 1) % scales.length;
    let next = scales[nextIdx];
    
    state.uiScale = next;
    document.documentElement.style.setProperty('--ui-scale', next.toString());
    localStorage.setItem('cpisi_ui_scale', next.toString());
};
