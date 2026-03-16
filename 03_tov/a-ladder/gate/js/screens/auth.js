// AUTH: Login Code Set and UI Transition
window.CPISI = window.CPISI || {};

window.toggleProfile = function() {
    const p = document.getElementById('extended-profile');
    const b = document.getElementById('toggle-prof-btn');
    if (p.style.display === 'none') {
        p.style.display = 'flex';
        b.innerText = '[ - HIDE DETAILS ]';
    } else {
        p.style.display = 'none';
        b.innerText = '[ + ADD PROFILE DETAILS ]';
    }
};

window.CPISI.executeAuth = async function(e) {
    if (e) e.preventDefault();

    const errDiv = document.getElementById('auth-error');
    const btn = document.getElementById('gate-seal-btn');

    // STAGE 1: Threshold Validation
    if (document.getElementById('threshold-stage').style.display !== 'none') {
        const user = document.getElementById('op-user').value.trim();
        const key = document.getElementById('op-key').value.trim();

        if (!key) { errDiv.innerText = "Key required."; return; }

        errDiv.innerText = "ALIGNING THRESHOLD...";
        btn.disabled = true;

        try {
            const resp = await fetch(window.CPISI.config.WORKER_URL, {
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
                window.currentInviteCode = key;
                document.getElementById('threshold-stage').style.display = 'none';
                document.getElementById('inhabitation-stage').style.display = 'flex';
                btn.innerText = "[ SEAL IDENTITY ]";
                btn.disabled = false;
                errDiv.innerText = "";
            } else {
                // Standard Login Success
                window.CPISI.saveState(data.data, key);
                window.CPISI.showMainStage();
            }
        } catch (err) { errDiv.innerText = err.message.toUpperCase(); btn.disabled = false; }
        return;
    }

    // STAGE 2: Account Creation
    const newUser = document.getElementById('new-user').value.trim();
    const newPass = document.getElementById('new-pass').value.trim();
    if (!newUser || !newPass) { errDiv.innerText = "Identity Name and Password required."; return; }

    const profile = {
        fullName: document.getElementById('prof-name').value.trim(),
        email: document.getElementById('prof-email').value.trim(),
        bio: document.getElementById('prof-bio').value.trim()
    };

    errDiv.innerText = "CREATING SOVEREIGN RECORD...";
    btn.disabled = true;

    try {
        const resp = await fetch(window.CPISI.config.WORKER_URL, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "CREATE_ACCOUNT",
                identity: { user: newUser, instance: "Dawndusk" },
                password: newPass,
                inviteCode: window.currentInviteCode,
                profile: profile
            })
        });
        const data = await resp.json();
        if (data.error) throw new Error(data.error);

        window.CPISI.saveState(data.data, newPass);
        window.CPISI.showMainStage();
    } catch (err) { errDiv.innerText = err.message.toUpperCase(); btn.disabled = false; }
};

window.CPISI.showMainStage = function(immediate = false) {
    const gate = document.getElementById('auth-screen');
    const stage = document.getElementById('main-stage');
    
    const render = () => {
        gate.style.display = 'none';
        stage.style.display = 'flex';
        document.getElementById('header-id').innerText = `DAWNDUSK ⊗ ${window.CPISI.state.identity.user.toUpperCase()}`;
    };

    if (immediate) render();
    else {
        document.getElementById('gate-structure').style.transform = "scale(1.1)";
        document.getElementById('gate-structure').style.opacity = "0";
        setTimeout(render, 600);
    }
};

window.executeAuth = window.CPISI.executeAuth;
