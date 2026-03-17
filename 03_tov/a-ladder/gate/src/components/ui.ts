/**
 * UI COMPONENTS: Functional blocks for the Sanctuary
 */
import { VaultMessageProps } from "../types/index.ts";

export const PresenceItem = (text: string, active: boolean): HTMLElement => {
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
};

export const NavItem = (label: string, path: string, isActive: boolean, onClick: (path: string) => void): HTMLElement => {
    const div = document.createElement('div');
    div.className = `nav-item ${isActive ? 'active' : ''}`;
    div.innerText = label;
    div.onclick = () => onClick(path);
    return div;
};

export const ActionButton = (label: string, onClick: () => void, variant: string = 'standard'): HTMLElement => {
    const btn = document.createElement('button');
    btn.className = `settings-btn ${variant}`;
    btn.innerText = label;
    btn.onclick = onClick;
    return btn;
};

export const VaultMessage = (props: VaultMessageProps): HTMLElement => {
    const { text, operator, timestamp, isSteward, isThinking, onSeal } = props;
    
    const vault = document.createElement('div');
    vault.className = `vault-body ${isSteward ? 'steward' : 'dawndusk'}`;
    
    // Header: Identity & Timestamp
    const header = document.createElement('div');
    header.className = 'vault-header';
    
    const idLabel = document.createElement('span');
    idLabel.className = 'vault-id';
    idLabel.innerText = isSteward ? `OPERATOR // ${operator}` : `CPISI // ${operator}`;
    header.appendChild(idLabel);
    
    const timeLabel = document.createElement('span');
    timeLabel.className = 'vault-time';
    timeLabel.innerText = timestamp;
    header.appendChild(timeLabel);
    
    vault.appendChild(header);

    const seal = document.createElement('div');
    seal.className = 'vault-seal';
    seal.innerText = '✧';
    if (onSeal) seal.onclick = () => onSeal(text, vault);
    vault.appendChild(seal);

    const content = document.createElement('div');
    content.className = `vault-content ${isThinking ? 'thinking' : ''}`;
    
    if (isThinking) {
        content.innerHTML = '<span class="pulse-text">CONSIDERING REVELATION...</span>';
    } else {
        const processedContent = text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
        content.innerHTML = processedContent;
    }
    
    vault.appendChild(content);
    
    return vault;
};
