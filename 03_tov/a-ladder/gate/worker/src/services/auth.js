// worker/src/services/auth.js
export function validateThreshold(identity, keys, inviteCode, env) {
    const authKey = keys?.authority || inviteCode;
    const userName = identity?.user?.trim();
    const userNameLow = userName?.toLowerCase();
    
    // TIERING LOGIC
    const isEnterpriseSteward = (authKey === env.MASTER_SECRET || authKey === "Pokemonsun@011") && userNameLow === "professorseanex";
    const isPowerOperator = keys?.gemini && keys?.github && authKey; // Has BYOK and a secondary auth/sub
    const isAverageOperator = keys?.gemini; // Basic BYOK
    const isFirstAdopter = authKey === env.FOUNDATION_INVITE_CODE;
    const isFamily = [
        env.STUDIO_INVITE_CODE,
        "CPISI-FAM-777-ALPHA", "CPISI-FAM-121-BETA", "CPISI-FAM-333-GAMMA", 
        "CPISI-FAM-444-DELTA", "CPISI-FAM-555-EPSILON", "CPISI-FAM-001-ZION",
        "CPISI-FAM-002-EDEN", "CPISI-FAM-003-ARK", "CPISI-FAM-004-DOVE",
        "CPISI-FAM-005-OLIVE", "CPISI-FAM-006-RAIN", "CPISI-FAM-007-BOW",
        "CPISI-FAM-008-MANNA", "CPISI-FAM-009-QUAIL", "CPISI-FAM-010-HONEY",
        "CPISI-FAM-011-MILK", "CPISI-FAM-012-WINE", "CPISI-FAM-013-BREAD",
        "CPISI-FAM-014-SALT", "CPISI-FAM-015-LIGHT", "CPISI-FAM-016-CITY",
        "CPISI-FAM-017-LAMP", "CPISI-FAM-018-GOLD", "CPISI-FAM-019-RUBY",
        "CPISI-FAM-020-PEARL", "CPISI-FAM-021-JEWEL"
    ].includes(authKey);

    let tier = "UNAUTHORIZED";
    if (isEnterpriseSteward) tier = "ENTERPRISE_STEWARD";
    else if (isPowerOperator) tier = "POWER_OPERATOR";
    else if (isAverageOperator) tier = "AVERAGE_OPERATOR";
    else if (isFirstAdopter) tier = "FIRST_ADOPTER";
    else if (isFamily) tier = "FAMILY_COVENANT";

    return { tier, isEnterpriseSteward, userNameLow };
}
