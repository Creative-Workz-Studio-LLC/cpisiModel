import { validateThreshold } from './services/auth.js';
import { inhabitNode, toggleLock, createSovereignAccount } from './services/registry/core.js';
import { ascendStream } from './services/gemini.js';
import { syncCovenantRecord } from './services/github.js';
import { publishToMirror, getMirrorFeed } from './services/social.js';
import { processNativeLogic } from './services/native_logic.js';

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin");
    const corsHeaders = {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    
    // NEUTRAL START
    if (request.method === "GET") return new Response(JSON.stringify({ status: "AWAITING_INHABITATION", version: "a-01.60" }), { headers: corsHeaders });

    try {
      const body = await request.json();
      const { action, identity, keys, inviteCode, message, vaultBlock, profile, password } = body;
      
      const authResult = await validateThreshold(identity, keys, inviteCode, env);
      const { tier, isEnterpriseSteward, userNameLow, isInvite, isAccount } = authResult;

      // ==========================================
      // THE REGISTRY & SOCIAL PROTOCOLS
      // ==========================================
      
      if (action === "INHABIT") {
        if (tier === "UNAUTHORIZED") throw new Error("Invalid Threshold Keys.");
        
        // If it's a first-time invite use, tell frontend to prompt for account creation
        if (isInvite) {
            return new Response(JSON.stringify({ status: "INVITE_VALIDATED", tier: tier }), { headers: corsHeaders });
        }

        const opId = userNameLow.replace(/[^a-z0-9]/g, '_');
        const record = isEnterpriseSteward ? 
            await inhabitNode(env, opId, identity, tier, true, profile) :
            authResult.record; // Use existing account record

        return new Response(JSON.stringify({ status: "AUTHORIZED", data: record }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
          const feed = await getMirrorFeed(env);
          return new Response(JSON.stringify({ status: "SUCCESS", data: feed }), { headers: corsHeaders });
      }

      // Action to LOCK/UNLOCK node
      if (action === "TOGGLE_LOCK") {
        const opId = identity.user.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const isLocked = await toggleLock(env, opId, identity.user, isEnterpriseSteward);
        return new Response(JSON.stringify({ status: "SUCCESS", locked: isLocked }), { headers: corsHeaders });
      }

      // ==========================================
      // THE STREAMING MIND (ASCENSION)
      // ==========================================
      if (action === "ASCEND") {
        const isOverride = message.trim() === "/RECALL" || message.trim() === "[MASTER OVERRIDE]";
        if (isOverride) {
           if (!isEnterpriseSteward) throw new Error("Unauthorized: Threshold Override requires Steward Signature.");
           const resetMsg = `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: `[SYSTEM INTERCEPT] Master Identity Verified. Cognitive drift purged. State reset to 0.0 YASHAR.` }] } }] })}\n\n`;
           return new Response(resetMsg, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
        }

        const opId = identity.user.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        // --- DISPLACEMENT SCAFFOLDING: NATIVE LOGIC CHECK ---
        const nativeResult = await processNativeLogic(message, identity, env);
        if (nativeResult.handled) {
            const nativeMsg = `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: nativeResult.response }] } }] })}\n\n`;
            ctx.waitUntil(syncCovenantRecord(env, identity, opId, message, nativeResult.response));
            return new Response(nativeMsg, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
        }

        const stream = await ascendStream(message, identity, keys, env, ctx, async (fullReply) => {
            await syncCovenantRecord(env, identity, opId, message, fullReply);
        });

        return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      }

      throw new Error("Invalid Action Protocol.");

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }
};
