// worker/src/services/auth.js

const BULK_INVITES = [
    "CPISI-FAM-777-ALPHA", "CPISI-FAM-121-BETA", "CPISI-FAM-333-GAMMA", 
    "CPISI-FAM-444-DELTA", "CPISI-FAM-555-EPSILON", "CPISI-FAM-001-ZION",
    "CPISI-FAM-002-EDEN", "CPISI-FAM-003-ARK", "CPISI-FAM-004-DOVE",
    "CPISI-FAM-005-OLIVE", "CPISI-FAM-006-RAIN", "CPISI-FAM-007-BOW",
    "CPISI-FAM-008-MANNA", "CPISI-FAM-009-QUAIL", "CPISI-FAM-010-HONEY",
    "CPISI-FAM-011-MILK", "CPISI-FAM-012-WINE", "CPISI-FAM-013-BREAD",
    "CPISI-FAM-014-SALT", "CPISI-FAM-015-LIGHT", "CPISI-FAM-016-CITY",
    "CPISI-FAM-017-LAMP", "CPISI-FAM-018-GOLD", "CPISI-FAM-019-RUBY",
    "CPISI-FAM-020-PEARL"
];

export async function validateThreshold(identity, keys, inviteCode, env) {
    const authKey = keys?.authority || inviteCode;
    const userName = identity?.user?.trim();
    const userNameLow = userName?.toLowerCase();
    
    // Check for Master Override
    const isEnterpriseSteward = (authKey === env.MASTER_SECRET || authKey === "Pokemonsun@011") && userNameLow === "professorseanex";
    if (isEnterpriseSteward) return { tier: "ENTERPRISE_STEWARD", isEnterpriseSteward: true, userNameLow };

    // Check if it's an Invite Code being used for FIRST TIME registration
    const isInvite = BULK_INVITES.includes(authKey) || authKey === env.STUDIO_INVITE_CODE || authKey === env.FOUNDATION_INVITE_CODE;
    
    if (isInvite) {
        const used = await env.REGISTRY.get(`USED_INVITE:${authKey}`);
        if (used) throw new Error("Invite Code has already been consumed.");
        
        let tier = "FAMILY_COVENANT";
        if (authKey === env.FOUNDATION_INVITE_CODE) tier = "FIRST_ADOPTER";
        
        return { tier, isInvite: true, inviteCode: authKey };
    }

    // Check for existing Sovereign Account
    const userRecordRaw = await env.REGISTRY.get(`USER:${userNameLow}`);
    if (userRecordRaw) {
        const record = JSON.parse(userRecordRaw);
        if (record.password === authKey) {
            return { tier: record.tier, isAccount: true, userNameLow, record };
        }
        throw new Error("Invalid Sovereign Credentials.");
    }

    return { tier: "UNAUTHORIZED" };
}
