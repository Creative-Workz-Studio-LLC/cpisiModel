// NAVIGATION: Covenant Path and Sidebar Handling
window.CPISI = window.CPISI || {};

window.CPISI.setPath = function(path, idx) {
    window.CPISI.state.currentPath = path;
    localStorage.setItem('cpisi_path', path);
    localStorage.setItem('cpisi_path_idx', idx);

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = Array.from(document.querySelectorAll('.nav-item')).find(el => el.innerText === path);
    if (activeNav) activeNav.classList.add('active');

    const segments = document.querySelectorAll('.path-segment');
    segments.forEach((seg, i) => {
        seg.classList.toggle('active', i === parseInt(idx));
    });

    if (path === 'REGISTRY' && window.CPISI.social) {
        window.CPISI.social.loadRegistry();
    }

    if (identity?.tier === 'STEWARD' && window.CPISI.appendTerminal) window.CPISI.appendTerminal(`PATH_SHIFT: ${path}`);
};

// Expose to global scope for HTML inline handlers
window.setPath = window.CPISI.setPath;
