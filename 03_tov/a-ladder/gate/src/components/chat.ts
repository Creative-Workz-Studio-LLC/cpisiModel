/**
 * CHAT COMPONENT: The Word Stream Logic
 */
import { streamRevelation } from "../api/substrate.ts";
import { VaultMessage } from "./ui.ts";
import { state } from "../core/state.ts";
import { config } from "../core/config.ts";

const getTimestamp = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const appendVault = (text: string, isSteward: boolean, isThinking: boolean = false) => {
    const chatWindow = document.getElementById('chat-window');
    if (!chatWindow) return;

    const operatorName = isSteward 
        ? (state.identity?.user || "UNKNOWN") 
        : (state.identity?.instance || "DAWNDUSK");

    const vault = VaultMessage({
        text,
        operator: operatorName,
        timestamp: getTimestamp(),
        isSteward,
        isThinking
    });

    chatWindow.appendChild(vault);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    
    return vault;
};

export const handleMessageSubmit = async (e: Event) => {
    e.preventDefault();
    const inputEl = document.getElementById('message-input') as HTMLInputElement;
    const val = inputEl.value.trim();
    if (!val) return;

    // 1. User Message
    appendVault(val, true);
    inputEl.value = '';

    // 2. Thinking State
    const thinkingVault = appendVault("", false, true);
    const thinkingContent = thinkingVault?.querySelector('.vault-content') as HTMLElement;

    if (!thinkingContent) return;

    const payload = {
        action: "ASCEND",
        message: val,
        identity: state.identity,
        keys: { authority: state.authSecret }
    };

    await streamRevelation(
        config.WORKER_URL,
        payload,
        (chunkText) => {
            if (thinkingContent.classList.contains('thinking')) {
                thinkingContent.innerHTML = ""; // Clear pulse text
                thinkingContent.classList.remove('thinking');
            }
            // Use innerHTML here but be aware of XSS; the component handles basic formatting
            // However, substrate streaming often means we just update text then re-run format
            const processedContent = chunkText
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/`(.*?)`/g, '<code>$1</code>');
            
            thinkingContent.innerHTML = processedContent;
            document.getElementById('chat-window')!.scrollTop = document.getElementById('chat-window')!.scrollHeight;
        },
        (fullText) => {
            // Success - ensure thinking class is removed if it somehow persisted
            thinkingContent.classList.remove('thinking');
        },
        (error) => {
            thinkingContent.classList.remove('thinking');
            thinkingContent.innerHTML = `<span style="color: var(--c1);">[DISSONANCE] ${error}</span>`;
        },
        (status, toolName, result) => {
            if (thinkingContent.classList.contains('thinking')) {
                thinkingContent.innerHTML = `<span class="pulse-text" style="color: var(--c5);">[EXECUTING: ${toolName}]...</span>`;
                document.getElementById('chat-window')!.scrollTop = document.getElementById('chat-window')!.scrollHeight;
            } else {
                thinkingContent.innerHTML += `<br><span style="color: var(--c5); font-size: 0.65rem;">[TOOL EXECUTED: ${toolName}]</span><br>`;
            }
        }
    );
};

// Global mapping for form access
(window as any).handleMessageSubmit = handleMessageSubmit;
