/**
 * AUTH SCREEN: Threshold and Inhabitation Logic
 */
import { saveState } from "../core/state.ts";
import { initUI } from "../core/ui.ts";
import { config } from "../core/config.ts";

export const executeAuth = async (e: Event) => {
    if (e) e.preventDefault();

    const errDiv = document.getElementById('auth-error');
    const btn = document.getElementById('gate-seal-btn') as HTMLButtonElement;
    const thresholdStage = document.getElementById('threshold-stage');
    const inhabitationStage = document.getElementById('inhabitation-stage');

    if (!errDiv || !btn || !thresholdStage || !inhabitationStage) return;

    // STAGE 1: Threshold Validation
    if (thresholdStage.style.display !== 'none') {
        const user = (document.getElementById('op-user') as HTMLInputElement).value.trim();
        const key = (document.getElementById('op-key') as HTMLInputElement).value.trim();

        if (!key) { errDiv.innerText = "Key required."; return; }

        errDiv.innerText = "ALIGNING THRESHOLD...";
        btn.disabled = true;

        try {
            const resp = await fetch(config.WORKER_URL, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    action: "INHABIT", 
                    identity: { user, instance: "Dawndusk" }, 
                    keys: { authority: key }, 
                    inviteCode: key 
                })
            });
            const data = await resp.json();
            if (data.error) throw new Error(data.error);

            if (data.status === "INVITE_VALIDATED") {
                // MOVE TO STAGE 2: New User Registration
                (window as any).currentInviteCode = key;
                (window as any).assignedTier = data.tier;
                thresholdStage.style.display = 'none';
                inhabitationStage.style.display = 'flex';
                btn.innerText = "[ SEAL IDENTITY ]";
                btn.disabled = false;
                errDiv.innerText = "";
            } else {
                // Standard Login Success
                saveState(data.data, key);
                showMainStage();
            }
        } catch (err: any) { errDiv.innerText = err.message.toUpperCase(); btn.disabled = false; }
        return;
    }

    // STAGE 2: Account Creation
    const newUsername = (document.getElementById('new-user') as HTMLInputElement).value.trim();
    const newPassword = (document.getElementById('new-pass') as HTMLInputElement).value.trim();
    const fullName = (document.getElementById('prof-name') as HTMLInputElement).value.trim();
    const email = (document.getElementById('prof-email') as HTMLInputElement).value.trim();
    const bio = (document.getElementById('prof-bio') as HTMLTextAreaElement).value.trim();

    if (!newUsername || !newPassword) {
        errDiv.innerText = "Username and Password required.";
        return;
    }

    btn.disabled = true;
    errDiv.innerText = "MANIFESTING IDENTITY...";

    try {
        const resp = await fetch(config.WORKER_URL, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "REGISTER",
                username: newUsername,
                password: newPassword,
                tier: (window as any).assignedTier || "FAMILY_COVENANT",
                inviteCode: (window as any).currentInviteCode,
                profile: {
                    fullName,
                    email,
                    bio,
                    visibility: { fullName: !!fullName, email: !!email, bio: true }
                }
            })
        });
        const data = await resp.json();
        if (data.error) throw new Error(data.error);

        saveState(data.data, newPassword);
        showMainStage();

    } catch (err: any) {
        errDiv.innerText = err.message.toUpperCase();
        btn.disabled = false;
    }
};

export const showMainStage = (immediate: boolean = false) => {
    const gate = document.getElementById('auth-screen');
    const sanctuary = document.getElementById('sanctuary-root');
    
    if (!gate || !sanctuary) return;

    const render = () => {
        gate.style.display = 'none';
        sanctuary.style.display = 'grid';
        initUI();
    };

    if (immediate) render();
    else {
        // Simple fade out
        gate.style.opacity = "0";
        gate.style.transition = "opacity 0.6s";
        setTimeout(render, 600);
    }
};

// Global mapping for form access
(window as any).executeAuth = executeAuth;
(window as any).toggleProfile = () => {
    const p = document.getElementById('extended-profile');
    const b = document.getElementById('toggle-prof-btn');
    if (p && b) {
        p.style.display = p.style.display === 'none' ? 'flex' : 'none';
        b.innerText = p.style.display === 'none' ? '[ + ADD PROFILE DETAILS ]' : '[ - HIDE DETAILS ]';
    }
};
