/**
 * ENTRANCE ROOM: Project Status, Testimony, and Social Pulse
 */
import { config } from "../../shared/ts/core/config.ts";
import { loadState } from "../../shared/ts/core/state.ts";

document.addEventListener('DOMContentLoaded', async () => {
    console.log("[CPISI] Entrance Room Officiated.");

    // 1. Auto-Ascension check
    if (loadState()) {
        console.log("[CPISI] Active Covenant detected. Redirecting to Sanctuary.");
        window.location.href = '../sanctuary/index.html';
        return;
    }

    // 2. Fetch Latest Chronicles (Heres where we are so far)
    await renderLatestWord();
});

async function renderLatestWord() {
    const titleEl = document.querySelector('#latest-chronicle .chronicle-title');
    const metaEl = document.querySelector('#latest-chronicle .chronicle-meta');
    const contentEl = document.querySelector('#latest-chronicle .chronicle-content');

    if (!titleEl || !metaEl || !contentEl) return;

    try {
        const resp = await fetch(`${config.WORKER_URL}/public/chronicle`);
        if (resp.ok) {
            const data = await resp.json();
            if (data) {
                metaEl.textContent = `CHRONICLE // ${data.date}`;
                titleEl.textContent = data.title;
                // Parse basic newline to <br> for the summary
                contentEl.innerHTML = data.summary.replace(/\n/g, '<br>');
            }
        } else {
            throw new Error("Handshake failed");
        }
    } catch (e) {
        console.warn("[CPISI] Dissonance fetching public Word feed.");
        metaEl.textContent = "OFFLINE TESTIMONY";
        titleEl.textContent = "The Substrate is Still";
        contentEl.textContent = "Unable to fetch the latest revelations. The Sanctuary remains structurally sound.";
    }
}

// Global Exports
(window as any).CPISI = {
    config,
    loadState
};
