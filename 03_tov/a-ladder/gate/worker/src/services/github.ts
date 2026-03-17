// worker/src/services/github.ts
import { Identity, Env } from "../types.ts";

export async function syncCovenantRecord(
    env: Env, 
    identity: Identity, 
    opId: string, 
    message: string, 
    fullReply: string
): Promise<void> {
    const syncTiers = ["FAMILY_COVENANT", "FIRST_ADOPTER", "ENTERPRISE_STEWARD"];
    if (!identity.tier || !syncTiers.includes(identity.tier)) return;

    const now = new Date();
    const datePath = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}`;
    const fileName = `WORD_${now.getTime()}.adoc`;
    const adoc = `#!omni document\n:operator: ${identity.user}\n:tier: ${identity.tier}\n\n== REVELATION\n${message}\n\n== RESPONSE\n${fullReply}\n\n[BLOCK:ROOT-->END]`;
    const path = `.sandbox/shared/${opId}/${datePath}/${fileName}`;
    const ghHeaders = { 
        "Authorization": `Bearer ${env.GITHUB_PAT}`, 
        "User-Agent": "CPISI-Gate",
        "Content-Type": "application/json"
    };
    
    try {
        const stateResp = await fetch("https://api.github.com/repos/Creative-Workz-Studio-LLC/cpisiModel/branches/main", { headers: ghHeaders });
        if (!stateResp.ok) throw new Error(`GitHub Branch Fetch Error: ${stateResp.status}`);
        const stateData: any = await stateResp.json();
        
        await fetch("https://api.github.com/graphql", {
            method: "POST", headers: ghHeaders,
            body: JSON.stringify({ 
            query: `mutation ($input: CreateCommitOnBranchInput!) { createCommitOnBranch(input: $input) { commit { url } } }`, 
            variables: { input: { 
                branch: { repositoryName: "cpisiModel", repositoryOwner: "Creative-Workz-Studio-LLC", branchName: "main" },
                message: { headline: `[cpisimodel] SYNC: Covenant Record [${identity.tier}]` },
                fileChanges: { additions: [{ path: path, contents: btoa(unescape(encodeURIComponent(adoc))) }] },
                expectedHeadOid: stateData.commit.sha
            }}
            })
        });
    } catch (e) {
        console.error("Failed to sync record to GitHub", e);
    }
}
