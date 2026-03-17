/**
 * MEMORY COMPONENT: The Brazen Laver Logic
 */
import { state } from "../core/state.ts";
import { PresenceItem } from "./ui.ts";

export const refreshMemory = () => {
    const memList = document.getElementById('memory-list');
    if (!memList) return;
    
    memList.innerHTML = '';
    
    const stateItems = [
        { text: "Substrate Active", active: true },
        { text: "Sanctuary Online", active: true },
        { text: `Operator: ${state.identity?.user || 'Unknown'}`, active: false },
        { text: `Coordinate: ${state.currentPath || 'WORD'}`, active: false }
    ];

    stateItems.forEach(item => {
        memList.appendChild(PresenceItem(item.text, item.active));
    });
};

export const addMemoryPulse = (text: string) => {
    const memList = document.getElementById('memory-list');
    if (!memList) return;
    
    const pulse = PresenceItem(text, true);
    memList.prepend(pulse);
    
    setTimeout(() => {
        pulse.style.opacity = '0.5';
    }, 3000);
};
