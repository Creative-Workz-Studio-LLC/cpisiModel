/**
 * SANDBOX SYSTEM: Isolated Build and Reconstruction logic
 */
import { config } from "../core/config.ts";
import { state } from "../core/state.ts";
import { SandboxActuator } from "../types/index.ts";

export const Sandbox: SandboxActuator = {
    loadView: function() {
        const chatWindow = document.getElementById('chat-window');
        if (!chatWindow) return;
        
        chatWindow.innerHTML = `
            <div class="panel-label">ISOLATED SANDBOX SUBSTRATE</div>
            <div class="vault-body">
                <div class="vault-content">
                    Greetings, Steward. You are now within the <strong>.sandbox</strong> boundary.
                    <br><br>
                    Here, you can build, break, and reconstruct "bricks" in absolute isolation from the core repository.
                    Every command executed here is automatically restricted to the local <code>/.sandbox</code> path.
                </div>
            </div>
            <div id="sandbox-logs" style="font-family: var(--font-mono); font-size: 0.8rem; color: #444; width: 100%; max-width: 850px;">
                > Ready for isolated manifestation.
            </div>
        `;
        
        // Update prompt for sandbox mode
        const prompt = document.getElementById('terminal-prompt');
        if (prompt && state.identity) {
            prompt.innerText = `${state.identity.user}@dawndusk:/.sandbox$`;
        }
    },

    execute: async function(command: string) {
        this.log(`RELAYING: ${command}`);
        
        try {
            const resp = await fetch(config.WORKER_URL, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "SANDBOX_EXEC",
                    identity: state.identity,
                    inviteCode: state.authSecret,
                    message: command
                })
            });
            const data = await resp.json();
            this.log(`SUBSTRATE: ${data.status} - ${data.message}`);
        } catch (e: any) {
            this.log(`DISSONANCE: ${e.message}`);
        }
    },

    log: function(msg: string) {
        const logs = document.getElementById('sandbox-logs');
        if (!logs) return;
        const div = document.createElement('div');
        div.innerText = `> ${msg}`;
        logs.appendChild(div);
        logs.scrollTop = logs.scrollHeight;
    }
};
