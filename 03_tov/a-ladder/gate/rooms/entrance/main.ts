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
    const feed = document.getElementById('word-feed');
    if (!feed) return;

    try {
        const resp = await fetch(`${config.WORKER_URL}/public/chronicle`);
        if (resp.ok) {
            const data = await resp.json();
            if (data) {
                // Update the first item with real data
                const items = feed.querySelectorAll('.feed-item');
                if (items.length > 0) {
                    const first = items[0] as HTMLElement;
                    first.querySelector('.feed-tag')!.textContent = `CHRONICLE // ${data.date}`;
                    first.querySelector('.feed-title')!.textContent = data.title;
                    first.querySelector('.feed-summary')!.textContent = data.summary;
                    first.style.borderColor = "var(--c3)"; // Gold highlight for new
                }
            }
        }
    } catch (e) {
        console.warn("[CPISI] Dissonance fetching public Word feed.");
    }
}

// Global Exports
(window as any).CPISI = {
    config,
    loadState
};
