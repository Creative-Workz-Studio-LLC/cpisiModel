// worker/src/services/registry/social.ts
import { Env, Identity, RegistryRecord, UserProfile, UserRecord } from "../../types.ts";

export async function getPublicProfile(env: Env, targetOpId: string) {
    const raw = await env.REGISTRY.get(`REGISTRY:${targetOpId}`);
    if (!raw) throw new Error("Sovereign Operator not found.");
    const data: RegistryRecord = JSON.parse(raw);
    
    // Enforce disclosure policy: Only return fields marked as visible
    return {
        username: data.user,
        tier: data.tier,
        bio: data.profile?.bio || "",
        fullName: data.profile?.visibility?.fullName ? data.profile.fullName : null,
        joined: data.joined
    };
}

export async function updateProfile(env: Env, opId: string, identityUser: string, updates: any) {
    const raw = await env.REGISTRY.get(`REGISTRY:${opId}`);
    if (!raw) throw new Error("Identity record not found.");
    
    const record: RegistryRecord = JSON.parse(raw);
    // Security check: Only the owner can update their profile
    if (record.user !== identityUser) throw new Error("Unauthorized profile modification.");
    
    // Deep merge updates to preserve nested objects (like visibility toggles)
    record.profile = {
        ...record.profile,
        ...updates,
        visibility: {
            ...record.profile?.visibility,
            ...(updates.visibility || {})
        }
    };
    
    await env.REGISTRY.put(`REGISTRY:${opId}`, JSON.stringify(record));
    return record.profile;
}

export async function saveVaultBlock(env: Env, opId: string, message: string, reply: string, isSteward: boolean) {
    // Save to the user's private history in KV
    const historyKey = `HISTORY:${opId}`;
    const rawHistory = await env.REGISTRY.get(historyKey);
    let history = rawHistory ? JSON.parse(rawHistory) : [];
    
    const timestamp = new Date().toISOString();
    // Maintain the conversational sequence
    history.push({ type: "revelation", text: message, timestamp, isSteward: true });
    history.push({ type: "response", text: reply, timestamp, isSteward: false });
    
    // Capping history length
    if (history.length > 100) history = history.slice(-100);
    
    await env.REGISTRY.put(historyKey, JSON.stringify(history));
    return history;
}

export async function getVaultHistory(env: Env, opId: string, identityUser: string) {
    // Security check
    const rawRecord = await env.REGISTRY.get(`REGISTRY:${opId}`);
    if (!rawRecord) throw new Error("Operator not found.");
    
    const record: RegistryRecord = JSON.parse(rawRecord);
    if (record.user !== identityUser) throw new Error("Unauthorized vault access.");

    const rawHistory = await env.REGISTRY.get(`HISTORY:${opId}`);
    return rawHistory ? JSON.parse(rawHistory) : [];
}

export async function getFollowedMirrorFeed(env: Env, opId: string) {
    // 1. Get the list of operators this user has a Covenant with
    const listResult = await env.REGISTRY.list({ prefix: `COVENANT:${opId}:` });
    
    // If they aren't following anyone, return the global feed as a fallback
    if (listResult.keys.length === 0) {
        const globalFeedRaw = await env.REGISTRY.get('MIRROR_FEED');
        return globalFeedRaw ? JSON.parse(globalFeedRaw) : [];
    }

    // 2. Extract target IDs
    const followedIds = listResult.keys.map(k => k.name.split(':')[2]);
    
    // 3. Gather their individual published TOV lists
    let federatedFeed: any[] = [];
    for (const targetId of followedIds) {
        const rawList = await env.REGISTRY.get(`TOV_LIST:${targetId}`);
        if (rawList) {
            const list: string[] = JSON.parse(rawList);
            // Fetch the actual record for each ID in their list
            for (const recordId of list) {
                const rawRecord = await env.REGISTRY.get(`MIRROR:${recordId}`);
                if (rawRecord) federatedFeed.push(JSON.parse(rawRecord));
            }
        }
    }
    
    // 4. Sort by date, newest first
    federatedFeed.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
    
    // 5. Cap the return size
    return federatedFeed.slice(0, 50);
}

export async function publishToMirror(env: Env, identity: Identity, vaultBlock: string) {
    const mirrorId = `mirror_${Date.now()}`;
    const opId = identity.user.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    const record = {
        id: mirrorId,
        operator: identity.user,
        tier: identity.tier,
        content: vaultBlock,
        published: new Date().toISOString()
    };
    
    // Store the actual record
    await env.REGISTRY.put(`MIRROR:${mirrorId}`, JSON.stringify(record));
    
    // Update Global Feed (The Town Square)
    const existing = await env.REGISTRY.get('MIRROR_FEED');
    let feed = existing ? JSON.parse(existing) : [];
    feed.unshift(record);
    feed = feed.slice(0, 50);
    await env.REGISTRY.put('MIRROR_FEED', JSON.stringify(feed));
    
    // Update Operator's Personal TOV List
    const personalRaw = await env.REGISTRY.get(`TOV_LIST:${opId}`);
    let personalList = personalRaw ? JSON.parse(personalRaw) : [];
    personalList.unshift(mirrorId);
    personalList = personalList.slice(0, 50);
    await env.REGISTRY.put(`TOV_LIST:${opId}`, JSON.stringify(personalList));
    
    return record;
}

export async function getRegistry(env: Env) {
    const list = await env.REGISTRY.list({ prefix: "USER:" });
    const operators: any[] = [];
    for (const key of list.keys) {
        const raw = await env.REGISTRY.get(key.name);
        if (raw) {
            const data: UserRecord = JSON.parse(raw);
            // Privacy filter
            operators.push({
                username: data.username,
                tier: data.tier,
                profile: {
                    fullName: data.profile?.visibility?.fullName ? data.profile.fullName : null,
                    bio: data.profile?.bio || "",
                    joined: data.created
                }
            });
        }
    }
    return operators;
}

export async function toggleCovenant(env: Env, followerId: string, targetId: string) {
    const key = `COVENANT:${followerId}:${targetId}`;
    const existing = await env.REGISTRY.get(key);
    
    if (existing) {
        await env.REGISTRY.delete(key);
        return { status: "DISSOLVED" };
    } else {
        await env.REGISTRY.put(key, JSON.stringify({ since: new Date().toISOString() }));
        return { status: "ESTABLISHED" };
    }
}
