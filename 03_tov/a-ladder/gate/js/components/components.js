// COMPONENTS: Functional UI blocks based on the Tabernacle pattern
window.CPISI = window.CPISI || {};
window.CPISI.components = {
    
    /**
     * The Presence Item (Brazen Laver / Altar feedback)
     */
    PresenceItem: function(text, active) {
        const div = document.createElement('div');
        div.className = 'mem-item';
        
        if (active) {
            const pulse = document.createElement('div');
            pulse.className = 'presence-pulse';
            div.appendChild(pulse);
        }
        
        const span = document.createElement('span');
        span.innerText = `> ${text}`;
        div.appendChild(span);
        
        return div;
    },

    /**
     * Vault Message (The Showbread - Nutritious Word)
     */
    VaultMessage: function(text, isSteward = false, isThinking = false, onSeal = null) {
        const vault = document.createElement('div');
        vault.className = `vault-body ${isSteward ? 'steward' : 'dawndusk'}`;
        
        // THE SEAL TRIGGER (THE HINGE)
        const seal = document.createElement('div');
        seal.className = 'vault-seal';
        seal.innerText = '✧';
        if (onSeal) seal.onclick = () => onSeal(text, vault);
        vault.appendChild(seal);

        const content = document.createElement('div');
        content.className = `vault-content ${isThinking ? 'thinking' : ''}`;
        
        // Basic Markdown-like formatting
        const processedContent = text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
            
        content.innerHTML = processedContent;
        vault.appendChild(content);
        
        return vault;
    },

    /**
     * Nav Item (The Ladder Steps)
     */
    NavItem: function(label, path, isActive, onClick) {
        const div = document.createElement('div');
        div.className = `nav-item ${isActive ? 'active' : ''}`;
        div.innerText = label;
        div.onclick = () => onClick(path);
        return div;
    },

    /**
     * Action Button (The Brazen Altar - Sacrifice/Action)
     */
    ActionButton: function(label, onClick, variant = 'standard') {
        const btn = document.createElement('button');
        btn.className = `settings-btn ${variant}`;
        btn.innerText = label;
        btn.onclick = onClick;
        return btn;
    }
};
