const REPO_API = "https://api.github.com/repos/Creative-Workz-Studio-LLC/cpisiModel/contents/03_tov/a-ladder/gate";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    
    // --- AUTHENTICATED API PROXY (The Professional Pipe) ---
    if (request.method === "GET") {
        let path = url.pathname;
        if (path === "/" || path === "") path = "/index.html";
        
        try {
            // Use the GitHub API 'raw' media type to fetch private files
            const apiUrl = `${REPO_API}${path}`;
            const response = await fetch(apiUrl, {
                headers: {
                    "Authorization": `Bearer ${env.GITHUB_PAT}`,
                    "Accept": "application/vnd.github.v3.raw",
                    "User-Agent": "CPISI-Gate-Gateway"
                },
                cf: { cacheTtl: 0 }
            });
            
            if (!response.ok) {
                return new Response(`[SUBSTRATE DISSONANCE] Resource ${path} not found in Private Vault. Status: ${response.status}`, { status: 404, headers: corsHeaders });
            }
            
            let contentType = "text/plain";
            if (path.endsWith(".html")) contentType = "text/html";
            else if (path.endsWith(".css")) contentType = "text/css";
            else if (path.endsWith(".js")) contentType = "application/javascript";
            else if (path.endsWith(".json")) contentType = "application/json";
            else if (path.endsWith(".png")) contentType = "image/png";

            return new Response(response.body, {
                headers: {
                    "Content-Type": contentType,
                    "Cache-Control": "no-store, no-cache, must-revalidate",
                    ...corsHeaders
                }
            });
        } catch (e) {
            return new Response(`Gateway Error: ${e.message}`, { status: 500, headers: corsHeaders });
        }
    }

    // --- SOVEREIGN PROTOCOLS ---
    try {
      const body = await request.json();
      const { action, identity, keys, inviteCode, message, vaultBlock, profile, password, targetId } = body;
      
      const authResult = await (async () => {
          // Re-importing logic inline for self-contained robustness if needed
          const { validateThreshold } = await import('./services/auth.js');
          return await validateThreshold(identity, keys, inviteCode, env);
      })();

      const { tier, isEnterpriseSteward, userNameLow, isInvite } = authResult;

      if (action === "INHABIT") {
        if (tier === "UNAUTHORIZED") throw new Error("Invalid Threshold Keys.");
        if (isInvite) return new Response(JSON.stringify({ status: "INVITE_VALIDATED", tier: tier }), { headers: corsHeaders });
        const opId = userNameLow.replace(/[^a-z0-9]/g, '_');
        const { inhabitNode } = await import('./services/registry/core.js');
        const record = isEnterpriseSteward ? await inhabitNode(env, opId, identity, tier, true, profile) : authResult.record; 
        return new Response(JSON.stringify({ status: "AUTHORIZED", data: record }), { headers: corsHeaders });
      }

      if (action === "ASCEND") {
        const opId = identity.user.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const { processNativeLogic } = await import('./services/native_logic.js');
        const nativeResult = await processNativeLogic(message, identity, env);
        if (nativeResult.handled) {
            const nativeMsg = `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: nativeResult.response }] } }] })}\n\n`;
            return new Response(nativeMsg, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
        }
        const { ascendStream } = await import('./services/gemini.js');
        const stream = await ascendStream(message, identity, keys, env, ctx, async (fullReply) => {
            const { saveVaultBlock } = await import('./services/registry/social.js');
            await saveVaultBlock(env, opId, message, fullReply, false);
        });
        return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      }

      // SOCIAL & REGISTRY
      if (action === "GET_MIRROR") {
          const { getFollowedMirrorFeed } = await import('./services/registry/social.js');
          const feed = await getFollowedMirrorFeed(env, userNameLow?.replace(/[^a-z0-9]/g, '_'));
          return new Response(JSON.stringify({ status: "SUCCESS", data: feed }), { headers: corsHeaders });
      }
      if (action === "GET_REGISTRY") {
          const { getRegistry } = await import('./services/registry/social.js');
          const operators = await getRegistry(env);
          return new Response(JSON.stringify({ status: "SUCCESS", data: operators }), { headers: corsHeaders });
      }

      throw new Error("Action Protocol Not Supported.");
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
  }
};
