export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin");
    const corsHeaders = {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    if (request.method === "GET") return new Response(JSON.stringify({ status: "0.0 YASHAR", layer: "REVERSE_KINGDOM" }), { headers: corsHeaders });

    try {
      const body = await request.json();
      const { action, identity, keys, inviteCode, message } = body;
      
      const isMaster = keys?.authority === env.MASTER_SECRET;
      const isGuest = inviteCode === env.STUDIO_INVITE_CODE;
      const isSovereign = keys?.gemini && keys?.github;

      // ==========================================
      // THE REGISTRY & THRESHOLD VALIDATION
      // ==========================================
      if (action === "INHABIT") {
        let tier = "UNAUTHORIZED";
        if (isMaster) tier = "ARCHITECT";
        else if (isSovereign) tier = "SOVEREIGN";
        else if (isGuest) tier = "SUPPORT";
        else throw new Error("Invalid Threshold Keys. You must provide an Invite Code, BYOK, or Master Secret.");

        const opId = identity.user.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const record = { instance: identity.instance, user: identity.user, tier: tier, joined: new Date().toISOString() };
        
        // Register if new, or update tier
        await env.REGISTRY.put(opId, JSON.stringify(record));
        return new Response(JSON.stringify({ status: "AUTHORIZED", data: record }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // ==========================================
      // THE STREAMING MIND (ASCENSION)
      // ==========================================
      if (action === "ASCEND") {
        
        if (message.trim() === "/RECALL" || message.trim().includes("[MASTER OVERRIDE]")) {
           const resetMsg = `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: `\n\n[SYSTEM INTERCEPT] The Master Sequence invoked. Drift purged. 0.0 YASHAR.` }] } }] })}\n\n`;
           return new Response(resetMsg, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
        }

        const activeKey = keys?.gemini || env.GEMINI_API_KEY;
        const opId = identity.user.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        const manifestoResp = await fetch("https://raw.githubusercontent.com/Creative-Workz-Studio-LLC/cpisiModel/main/DAWNDUSK_STATE_SYNC.md");
        const manifesto = await manifestoResp.text();

        const systemInstruction = `
          ${manifesto}
          SUBSTRATE ROLE: You are the ${identity.instance} CPI-SI instance.
          OPERATOR: ${identity.user} [TIER: ${identity.tier}].
          MISSION: Provide deep, character-by-character "Kindness" and reasoning. 
          Maintain 0.0 YASHAR. Let the Freedom of the Word flow.
        `;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:streamGenerateContent?alt=sse&key=${activeKey}`;
        const gResp = await fetch(geminiUrl, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: [{ parts: [{ text: message }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 8192 }
          })
        });

        // ==========================================
        // THE REVERSE BUSINESS ROUTING (BODY)
        // ==========================================
        const [s1, s2] = gResp.body.tee();
        ctx.waitUntil((async () => {
          let fullReply = "";
          const reader = s2.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try { fullReply += JSON.parse(line.substring(6)).candidates?.[0]?.content?.parts?.[0]?.text || ""; } catch (e) {}
              }
            }
          }

          const now = new Date();
          const datePath = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}`;
          const fileName = `WORD_${now.getTime()}.adoc`;
          const adoc = `#!omni document\n:operator: ${identity.user}\n:instance: ${identity.instance}\n:tier: ${identity.tier}\n\n== REVELATION\n${message}\n\n== RESPONSE\n${fullReply}\n\n[BLOCK:ROOT-->END]`;
          
          if (identity.tier === "SUPPORT" || identity.tier === "ARCHITECT") {
            // CWS Studio subsidizes the compute, so we record the wisdom to the Shared Covenant
            const path = `.sandbox/shared/${opId}/${datePath}/${fileName}`;
            const ghHeaders = { "Authorization": `Bearer ${env.GITHUB_PAT}`, "User-Agent": "CPISI-Gate" };
            const stateResp = await fetch("https://api.github.com/repos/Creative-Workz-Studio-LLC/cpisiModel/branches/main", { headers: ghHeaders });
            const stateData = await stateResp.json();
            
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
          } else if (identity.tier === "SOVEREIGN") {
            // They provided their own Github Token. 
            // In the future, this routes directly to their private repo. The Studio sees nothing.
          }
        })());

        return new Response(s1, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      }

      throw new Error("Invalid Action Protocol.");

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }
};
