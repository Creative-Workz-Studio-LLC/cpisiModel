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

    // 2. Fetch Latest Word (Optional / Simulated for now)
    await renderLatestWord();

    // 3. 2.5K Scaling Verification
    verifyScaling();
});

async function renderLatestWord() {
    const feed = document.getElementById('word-feed');
    if (!feed) return;

    try {
        // Future: Fetch real blog/update data from the Worker's public endpoint
        // const resp = await fetch(`${config.WORKER_URL}/public/word`);
        // if (resp.ok) { ... }
    } catch (e) {
        console.warn("[CPISI] Dissonance fetching public Word feed.");
    }
}

function verifyScaling() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    console.log(`[CPISI] Substrate Dimensions: ${width}x${height}`);
    
    if (width >= 2560) {
        console.log("[CPISI] 2.5K High-Density Surface Identified.");
    }
}

// Global Exports
(window as any).CPISI = {
    config,
    loadState
};
