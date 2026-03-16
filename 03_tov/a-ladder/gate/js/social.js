// js/social.js: The Covenant Mirror Feed Logic
window.CPISI = window.CPISI || {};

window.CPISI.social = {
    loadMirrorFeed: async function() {
        console.log("CPISI: Fetching Global Mirror Feed...");
        const mirrorContent = document.getElementById('mirror-content');
        if (!mirrorContent) return;

        try {
            const resp = await fetch(window.CPISI.config.WORKER_URL, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "GET_MIRROR" })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error);

            if (data.data && data.data.length > 0) {
                mirrorContent.innerHTML = ''; // Clear "Select a Word" placeholder
                data.data.forEach(item => {
                    const block = document.createElement('div');
                    block.className = 'mirror-item';
                    block.style.marginBottom = '30px';
                    block.innerHTML = `
                        <div style="font-size: 9px; color: var(--c4); letter-spacing: 2px; margin-bottom: 8px;">
                            ${item.operator.toUpperCase()} // ${item.tier}
                        </div>
                        <div style="color: #888; line-height: 1.6;">${item.content}</div>
                        <div style="font-size: 7px; color: #222; margin-top: 8px;">${new Date(item.published).toLocaleString()}</div>
                    `;
                    mirrorContent.appendChild(block);
                });
            }
        } catch (e) {
            console.error("CPISI: Mirror Feed Dissonance", e);
        }
    }
};

// Auto-load feed when entering Sanctuary
window.addEventListener('DOMContentLoaded', () => {
    if (window.CPISI.loadState()) {
        setTimeout(window.CPISI.social.loadMirrorFeed, 1000);
    }
});
