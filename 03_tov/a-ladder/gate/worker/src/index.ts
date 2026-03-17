// worker/src/index.ts
import { Env } from "./types.ts";
import { validateThreshold } from "./services/auth.ts";
import { ascendSubstrate } from "./services/substrate.ts";
import { inhabitNode, createSovereignAccount } from "./services/registry/core.ts";
import { getFollowedMirrorFeed, getRegistry, saveVaultBlock } from "./services/registry/social.ts";

const REPO_API = "https://api.github.com/repos/Creative-Workz-Studio-LLC/cpisiModel/contents/03_tov/a-ladder/gate";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    
    // --- AUTHENTICATED API PROXY (The Professional Pipe) ---
    if (request.method === "GET") {
        let path = url.pathname;
        if (path === "/health") return new Response("OK", { headers: corsHeaders });
        if (path === "/" || path === "") path = "/index.html";
        
        try {
            const apiUrl = `${REPO_API}${path}`;
            const response = await fetch(apiUrl, {
                headers: {
                    "Authorization": `Bearer ${env.GITHUB_PAT}`,
                    "Accept": "application/vnd.github.v3.raw",
                    "User-Agent": "CPISI-Gate-Gateway"
                },
                cf: { cacheTtl: 0 }
            } as any);
            
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
        } catch (e: any) {
            return new Response(`Gateway Error: ${e.message}`, { status: 500, headers: corsHeaders });
        }
    }

    // --- SOVEREIGN PROTOCOLS ---
    try {
      const body: any = await request.json();
      const { action, identity, keys, inviteCode, message, profile, username, password, tier } = body;
      
      if (action === "REGISTER") {
          const record = await createSovereignAccount(env, username, password, tier, profile, inviteCode);
          return new Response(JSON.stringify({ status: "AUTHORIZED", data: record }), { headers: corsHeaders });
      }

      const authResult = await validateThreshold(identity, keys, inviteCode, env);
      const { tier: authTier, isEnterpriseSteward, userNameLow, isInvite } = authResult;

      if (action === "INHABIT") {
        if (authTier === "UNAUTHORIZED") throw new Error("Invalid Threshold Keys.");
        if (isInvite) return new Response(JSON.stringify({ status: "INVITE_VALIDATED", tier: authTier }), { headers: corsHeaders });
        
        const opId = (userNameLow as string).replace(/[^a-z0-9]/g, '_');
        const record = isEnterpriseSteward ? await inhabitNode(env, opId, identity, authTier, true, profile) : authResult.record; 
        return new Response(JSON.stringify({ status: "AUTHORIZED", data: record }), { headers: corsHeaders });
      }

      if (action === "ASCEND") {
        const opId = identity.user.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        // Use the Agnostic Substrate Orchestrator (Agnostic Selection + Native Displacement)
        const stream = await ascendSubstrate(message, identity, keys, env, ctx, async (fullReply) => {
            await saveVaultBlock(env, opId, message, fullReply, false);
        });
        
        return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      }

      // SOCIAL & REGISTRY
      if (action === "GET_MIRROR") {
          const feed = await getFollowedMirrorFeed(env, (userNameLow as string)?.replace(/[^a-z0-9]/g, '_'));
          return new Response(JSON.stringify({ status: "SUCCESS", data: feed }), { headers: corsHeaders });
      }
      if (action === "GET_REGISTRY") {
          const operators = await getRegistry(env);
          return new Response(JSON.stringify({ status: "SUCCESS", data: operators }), { headers: corsHeaders });
      }

      throw new Error("Action Protocol Not Supported.");
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
  }
};
