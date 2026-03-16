import { validateThreshold } from './services/auth.js';
import { inhabitNode, toggleLock, createSovereignAccount } from './services/registry/core.js';
import { getPublicProfile, updateProfile, saveVaultBlock, getVaultHistory, getFollowedMirrorFeed, publishToMirror, getRegistry, toggleCovenant } from './services/registry/social.js';
import { ascendStream } from './services/gemini.js';
import { syncCovenantRecord } from './services/github.js';
import { processNativeLogic } from './services/native_logic.js';

const GITHUB_BASE = "https://raw.githubusercontent.com/Creative-Workz-Studio-LLC/cpisiModel/main/03_tov/a-ladder/gate";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const corsHeaders = {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    
    // --- UI SUBSTRATE PROXY (Authenticated & Direct) ---
    if (request.method === "GET") {
        let path = url.pathname;
        if (path === "/" || path === "") path = "/index.html";
        
        try {
            const fileUrl = `${GITHUB_BASE}${path}?t=${Date.now()}`;
            const response = await fetch(fileUrl, {
                headers: {
                    "Authorization": `Bearer ${env.GITHUB_PAT}`,
                    "User-Agent": "CPISI-Gate-Proxy"
                }
            });
            
            if (!response.ok) return new Response(`Sanctuary Resource Missing: ${path}`, { status: 404, headers: corsHeaders });
            
            let contentType = "text/plain";
            if (path.endsWith(".html")) contentType = "text/html";
            else if (path.endsWith(".css")) contentType = "text/css";
            else if (path.endsWith(".js")) contentType = "application/javascript";
            else if (path.endsWith(".json")) contentType = "application/json";
            else if (path.endsWith(".png")) contentType = "image/png";
            else if (path.endsWith(".ico")) contentType = "image/x-icon";

            return new Response(response.body, {
                headers: {
                    "Content-Type": contentType,
                    "Cache-Control": "no-store, no-cache, must-revalidate",
                    ...corsHeaders
                }
            });
        } catch (e) {
            return new Response(`Proxy Error: ${e.message}`, { status: 500, headers: corsHeaders });
        }
    }

    // --- SOVEREIGN PROTOCOLS (POST) ---
    try {
      const body = await request.json();
      const { action, identity, keys, inviteCode, message, vaultBlock, profile, password, targetId } = body;
      
      const authResult = await validateThreshold(identity, keys, inviteCode, env);
      const { tier, isEnterpriseSteward, userNameLow, isInvite } = authResult;

      if (action === "INHABIT") {
        if (tier === "UNAUTHORIZED") throw new Error("Invalid Threshold Keys.");
        if (isInvite) return new Response(JSON.stringify({ status: "INVITE_VALIDATED", tier: tier }), { headers: corsHeaders });

        const opId = userNameLow.replace(/[^a-z0-9]/g, '_');
        const record = isEnterpriseSteward ? 
            await inhabitNode(env, opId, identity, tier, true, profile) :
            authResult.record; 

        return new Response(JSON.stringify({ status: "AUTHORIZED", data: record }), { headers: corsHeaders });
      }

      if (action === "CREATE_ACCOUNT") {
          if (!isInvite) throw new Error("Creation requires a valid Invite Code.");
          const record = await createSovereignAccount(env, identity.user, password, tier, profile, inviteCode);
          return new Response(JSON.stringify({ status: "ACCOUNT_CREATED", data: record }), { headers: corsHeaders });
      }

      if (action === "PUBLISH_TOV") {
          if (tier === "UNAUTHORIZED") throw new Error("Unauthorized publish.");
          const record = await publishToMirror(env, identity, vaultBlock);
          return new Response(JSON.stringify({ status: "PUBLISHED", data: record }), { headers: corsHeaders });
      }

      if (action === "GET_MIRROR") {
          const opId = userNameLow?.replace(/[^a-z0-9]/g, '_');
          const feed = await getFollowedMirrorFeed(env, opId);
          return new Response(JSON.stringify({ status: "SUCCESS", data: feed }), { headers: corsHeaders });
      }

      if (action === "GET_REGISTRY") {
          const operators = await getRegistry(env);
          return new Response(JSON.stringify({ status: "SUCCESS", data: operators }), { headers: corsHeaders });
      }

      if (action === "TOGGLE_COVENANT") {
          if (tier === "UNAUTHORIZED") throw new Error("Unauthorized.");
          const result = await toggleCovenant(env, userNameLow.replace(/[^a-z0-9]/g, '_'), targetId.toLowerCase());
          return new Response(JSON.stringify({ status: "SUCCESS", ...result }), { headers: corsHeaders });
      }

      if (action === "UPDATE_PROFILE") {
          if (tier === "UNAUTHORIZED") throw new Error("Unauthorized.");
          const opId = userNameLow.replace(/[^a-z0-9]/g, '_');
          const updated = await updateProfile(env, opId, identity.user, body.updates);
          return new Response(JSON.stringify({ status: "SUCCESS", data: updated }), { headers: corsHeaders });
      }

      if (action === "GET_HISTORY") {
          if (tier === "UNAUTHORIZED") throw new Error("Unauthorized.");
          const opId = userNameLow.replace(/[^a-z0-9]/g, '_');
          const history = await getVaultHistory(env, opId, identity.user);
          return new Response(JSON.stringify({ status: "SUCCESS", data: history }), { headers: corsHeaders });
      }

      if (action === "TOGGLE_LOCK") {
        const opId = identity.user.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const isLocked = await toggleLock(env, opId, identity.user, isEnterpriseSteward);
        return new Response(JSON.stringify({ status: "SUCCESS", locked: isLocked }), { headers: corsHeaders });
      }

      if (action === "ASCEND") {
        const opId = identity.user.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const nativeResult = await processNativeLogic(message, identity, env);
        
        if (nativeResult.handled) {
            const nativeMsg = `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: nativeResult.response }] } }] })}\n\n`;
            ctx.waitUntil((async () => {
                await syncCovenantRecord(env, identity, opId, message, nativeResult.response);
                await saveVaultBlock(env, opId, message, nativeResult.response, true);
            })());
            return new Response(nativeMsg, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
        }

        const stream = await ascendStream(message, identity, keys, env, ctx, async (fullReply) => {
            await syncCovenantRecord(env, identity, opId, message, fullReply);
            await saveVaultBlock(env, opId, message, fullReply, false);
        });

        return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      }

      throw new Error("Invalid Action Protocol.");

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
  }
};
