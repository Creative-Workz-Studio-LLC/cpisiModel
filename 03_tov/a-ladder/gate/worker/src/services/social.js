// worker/src/services/social.js

export async function publishToMirror(env, identity, vaultBlock) {
    const mirrorId = `mirror_${Date.now()}`;
    const record = {
        id: mirrorId,
        operator: identity.user,
        tier: identity.tier,
        content: vaultBlock,
        published: new Date().toISOString()
    };
    
    await env.REGISTRY.put(`MIRROR:${mirrorId}`, JSON.stringify(record));
    
    const existing = await env.REGISTRY.get('MIRROR_FEED');
    let feed = existing ? JSON.parse(existing) : [];
    feed.unshift(record);
    feed = feed.slice(0, 50);
    await env.REGISTRY.put('MIRROR_FEED', JSON.stringify(feed));
    
    return record;
}

export async function getMirrorFeed(env) {
    const feed = await env.REGISTRY.get('MIRROR_FEED');
    return feed ? JSON.parse(feed) : [];
}

// --- NEW SOCIAL DISCOVERY PROTOCOLS ---

export async function getRegistry(env) {
    const list = await env.REGISTRY.list({ prefix: "USER:" });
    const operators = [];
    for (const key of list.keys) {
        const raw = await env.REGISTRY.get(key.name);
        if (raw) {
            const data = JSON.parse(raw);
            // Privacy filter: only return what they shared
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

export async function toggleCovenant(env, followerId, targetId) {
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
