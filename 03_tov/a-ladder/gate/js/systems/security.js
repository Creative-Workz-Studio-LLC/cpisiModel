// SECURITY: The Vault and Key Lifecycle
window.CPISI = window.CPISI || {};

window.CPISI.security = {
    // Detect the nature of the threshold key
    identifyKeyType: function(key) {
        if (!key) return "NONE";
        
        // Gemini API Keys usually start with AIza
        if (key.startsWith("AIza")) return "GEMINI_SUBSTRATE";
        
        // CPISI Invite Codes
        if (key.startsWith("CPISI-FAM-")) return "FAMILY_INVITE";
        if (key.startsWith("CPISI-PRO-")) return "STEWARD_INVITE";
        
        // Master Secret
        if (key === "Pokemonsun@011") return "MASTER_OVERRIDE";
        
        return "UNKNOWN_THRESHOLD";
    },

    // Securely store keys in session/local storage
    persistSubstrateKey: function(key) {
        if (key && key.startsWith("AIza")) {
            localStorage.setItem('cpisi_substrate_gemini', key);
            console.log("CPISI: Substrate Linked.");
            return true;
        }
        return false;
    },

    getSubstrateKey: function() {
        return localStorage.getItem('cpisi_substrate_gemini');
    }
};
