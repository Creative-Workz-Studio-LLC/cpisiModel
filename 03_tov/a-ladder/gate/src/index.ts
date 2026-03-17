/**
 * THE SANCTUARY GATE: Main Entry Point & Orchestrator
 */
import { state, loadState } from "./core/state.ts";
import { config } from "./core/config.ts";
import { initUI, enterThreshold } from "./core/ui.ts";
import { Vault } from "./screens/vault.ts";
import { refreshMemory } from "./components/memory.ts";
import { Social } from "./systems/social.ts";
import { Sandbox } from "./systems/sandbox.ts";
import { handleMessageSubmit } from "./components/chat.ts";

// Attach to window for legacy support and global access
(window as any).CPISI = {
    ...(window as any).CPISI,
    config,
    state,
    loadState,
    ui: {
        init: initUI,
        enterThreshold
    },
    vault: Vault,
    social: Social,
    sandbox: Sandbox,
    memory: {
        refresh: refreshMemory
    }
};

// Also attach global handlers for HTML onsubmit/onclick
(window as any).handleMessageSubmit = handleMessageSubmit;

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const isRoot = path.endsWith('index.html') || path.endsWith('/');
    const isLoggedIn = loadState();

    if (isRoot) {
        // Orchestrate initial entry
        if (isLoggedIn) {
            window.location.href = 'sanctuary.html';
        } else {
            window.location.href = 'entrance.html';
        }
        return;
    }

    // Room-specific initialization
    if (path.endsWith('sanctuary.html')) {
        if (!isLoggedIn) {
            window.location.href = 'entrance.html';
            return;
        }
        initUI();
        refreshMemory();
    } else if (path.endsWith('threshold.html')) {
        if (isLoggedIn) {
            window.location.href = 'sanctuary.html';
            return;
        }
        // Logic for threshold is primarily handled via exports in bundle
    } else if (path.endsWith('entrance.html')) {
        if (isLoggedIn) {
            window.location.href = 'sanctuary.html';
            return;
        }
    }
});
