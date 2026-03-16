// NAVIGATION: Lifecycle and View Management
window.CPISI = window.CPISI || {};

window.CPISI.setPath = function(path, idx) {
    window.CPISI.state.currentPath = path;
    localStorage.setItem('cpisi_path', path);
    localStorage.setItem('cpisi_path_idx', idx);

    // Update Sidebar Visuals
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = Array.from(document.querySelectorAll('.nav-item')).find(el => el.innerText === path);
    if (activeNav) activeNav.classList.add('active');

    // Update Covenant Path (7 segments)
    const segments = document.querySelectorAll('.path-segment');
    segments.forEach((seg, i) => {
        seg.classList.toggle('active', i === parseInt(idx));
    });

    // View Layer Switching
    document.querySelectorAll('.view-layer').forEach(layer => layer.classList.remove('active'));
    
    if (path === 'REGISTRY') {
        document.getElementById('view-registry').classList.add('active');
        if (window.CPISI.social) window.CPISI.social.loadRegistry();
    } else if (path === 'VOID') {
        document.getElementById('view-void').classList.add('active');
    } else if (path === 'GATE') {
        // Social Media Feed
        document.getElementById('view-sanctuary').classList.add('active');
        if (window.CPISI.social) window.CPISI.social.loadMirrorFeed();
    } else {
        // Default to WORD (Sanctuary)
        document.getElementById('view-sanctuary').classList.add('active');
    }

    if (window.CPISI.state.identity?.tier === 'ENTERPRISE_STEWARD' && window.CPISI.appendTerminal) {
        window.CPISI.appendTerminal(`LIFECYCLE_SHIFT: ${path}`);
    }
};

window.setPath = window.CPISI.setPath;
