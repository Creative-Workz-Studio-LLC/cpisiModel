/**
 * THE COVENANT: Core TypeScript Interfaces for the Sanctuary Gate
 */

export interface Identity {
    user: string;
    instance: string;
    tier?: string;
    profile?: {
        fullName?: string;
        email?: string;
        bio?: string;
    };
}

export interface SanctuaryState {
    identity: Identity | null;
    authSecret: string | null;
    currentPath: string;
    uiScale: number;
}

export interface ComponentProps {
    [key: string]: any;
}

export type SanctuaryPath = 'WORD' | 'VOID' | 'TOV' | 'SCROLL' | 'GATE' | 'REGISTRY';

export interface VaultActuator {
    toggle: () => void;
    init: () => void;
    checkNetwork: () => Promise<void>;
    checkDatabase: () => void;
    renderDynamics: () => void;
}

export interface SocialActuator {
    loadMirrorFeed: () => Promise<void>;
    loadRegistry: () => Promise<void>;
    updateProfile: () => Promise<void>;
}

export interface SandboxActuator {
    loadView: () => void;
    execute: (command: string) => Promise<void>;
    log: (msg: string) => void;
}

export interface SubstrateStreamChunk {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
    }>;
}

export interface VaultMessageProps {
    text: string;
    operator: string;
    timestamp: string;
    isSteward: boolean;
    isThinking: boolean;
    onSeal?: (text: string, el: HTMLElement) => void;
}
