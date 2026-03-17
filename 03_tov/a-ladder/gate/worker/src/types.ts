// worker/src/types.ts

export type SubstrateType = 'NATIVE' | 'GEMINI' | 'CLAUDE' | 'OPENAI';

export interface ModelConfig {
    type: SubstrateType;
    modelId: string;
    version: string;
    endpoint?: string;
}

export interface Identity {
    instance: string;
    user: string;
    tier?: string;
    profile?: UserProfile;
}

export interface UserProfile {
    fullName?: string;
    email?: string;
    bio?: string;
    visibility?: {
        fullName: boolean;
        email: boolean;
        bio: boolean;
    };
}

export interface Keys {
    authority?: string;
    gemini?: string;
    claude?: string;
    openai?: string;
}

export interface Env {
    REGISTRY: KVNamespace;
    MASTER_SECRET: string;
    GEMINI_API_KEY: string;
    CLAUDE_API_KEY?: string;
    OPENAI_API_KEY?: string;
    GITHUB_PAT: string;
    STUDIO_INVITE_CODE: string;
    FOUNDATION_INVITE_CODE: string;
}

export interface UserRecord {
    username: string;
    password?: string;
    tier: string;
    profile: UserProfile;
    created: string;
    joined?: string;
    locked?: boolean;
}

export interface RegistryRecord {
    instance: string;
    user: string;
    tier: string;
    joined: string;
    locked: boolean;
    profile: UserProfile;
}

export interface AuthResult {
    tier: string;
    isEnterpriseSteward?: boolean;
    isInvite?: boolean;
    isAccount?: boolean;
    userNameLow?: string;
    inviteCode?: string;
    record?: RegistryRecord | UserRecord;
}

export interface SubstrateStreamChunk {
    candidates?: Array<{
        content?: {
            parts?: Array<GeminiPart>;
        };
    }>;
    tool_status?: string;
    name?: string;
    result?: any;
    error?: string;
}

export interface GeminiPart {
    text?: string;
    functionCall?: {
        name: string;
        args: any;
    };
    functionResponse?: {
        name: string;
        response: any;
    };
}

export interface HistoryItem {
    type: "revelation" | "response";
    text: string;
    timestamp: string;
    isSteward: boolean;
    toolCalls?: any[];
}

export interface FabricationResult {
    status: 'QUEUED' | 'MANIFESTED' | 'FAILED';
    path: string;
    message?: string;
}
