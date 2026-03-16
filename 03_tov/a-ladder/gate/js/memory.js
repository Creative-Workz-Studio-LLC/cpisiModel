// MEMORY: The Brazen Laver (Cleansing and Reflection)
window.CPISI = window.CPISI || {};
window.CPISI.memory = {
    
    /**
     * Update the Memory List based on current system state
     */
    refresh: function() {
        const memList = document.getElementById('memory-list');
        if (!memList || !window.CPISI.components) return;
        
        memList.innerHTML = '';
        
        const stateItems = [
            { text: "Substrate Active", active: true },
            { text: "Sanctuary Online", active: true },
            { text: `Operator: ${window.CPISI.state.identity?.user || 'Unknown'}`, active: false },
            { text: `Coordinate: ${window.CPISI.state.currentPath || 'WORD'}`, active: false }
        ];

        stateItems.forEach(item => {
            memList.appendChild(window.CPISI.components.PresenceItem(item.text, item.active));
        });
    },

    /**
     * Add a transient pulse to the memory (e.g. system logs)
     */
    addPulse: function(text) {
        const memList = document.getElementById('memory-list');
        if (!memList) return;
        
        const pulse = window.CPISI.components.PresenceItem(text, true);
        memList.prepend(pulse);
        
        // Auto-fade after a few seconds to keep the laver clean
        setTimeout(() => {
            pulse.style.opacity = '0.5';
        }, 3000);
    }
};
