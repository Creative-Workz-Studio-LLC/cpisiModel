// worker/src/services/substrate.ts
import { Identity, Keys, Env, ModelConfig, HistoryItem, SubstrateStreamChunk } from "../types.ts";
import { getVaultHistory } from "./registry/social.ts";
import { processNativeLogic } from "./native_logic.ts";

/**
 * THE SUBSTRATE ORCHESTRATOR
 * Selects and manages the active AI co-processor (Gemini, Claude, etc.)
 * or routes to native CPI-SI logic for displacement.
 */

export async function ascendSubstrate(
    message: string,
    identity: Identity,
    keys: Keys,
    env: Env,
    ctx: ExecutionContext,
    onComplete?: (fullReply: string) => Promise<void>
): Promise<ReadableStream> {
    
    // 1. DYNAMIC MODEL SELECTION (Agnostic Strategy)
    const config = selectBestModel(env, keys);
    const opId = identity.user.toLowerCase().replace(/[^a-z0-9]/g, '_');

    // 2. GATHER CONTEXT (The Hinge)
    const history: HistoryItem[] = await getVaultHistory(env, opId, identity.user);
    const manifesto = await fetchManifesto(env);

    // 3. NATIVE DISPLACEMENT CHECK
    const native = await processNativeLogic(message, identity, env);
    if (native.handled) {
        return streamNativeResponse(native.response || "");
    }

    // 4. ROUTE TO ACTIVE CO-PROCESSOR
    if (config.type === 'GEMINI') {
        return await streamGemini(message, identity, keys, env, ctx, config, history, manifesto, onComplete);
    }

    throw new Error(`Substrate Type [${config.type}] not yet officiating.`);
}

function selectBestModel(env: Env, keys: Keys): ModelConfig {
    // Priority: Explicit Key -> Env Key -> Default
    // We target 1.5 Pro as the current high-water mark, ready for 2.0/3.1
    if (keys.gemini || env.GEMINI_API_KEY) {
        return { 
            type: 'GEMINI', 
            modelId: 'gemini-1.5-pro', 
            version: 'v1beta',
            endpoint: 'streamGenerateContent' 
        };
    }
    // Future: Add Claude/OpenAI logic here
    throw new Error("No valid Substrate Keys identified.");
}

async function streamGemini(
    message: string,
    identity: Identity,
    keys: Keys,
    env: Env,
    ctx: ExecutionContext,
    config: ModelConfig,
    history: HistoryItem[],
    manifesto: string,
    onComplete?: (fullReply: string) => Promise<void>
): Promise<ReadableStream> {
    const activeKey = keys.gemini || env.GEMINI_API_KEY;
    const stewardName = identity.profile?.fullName || identity.user;

    const systemInstruction = `
      ${manifesto}
      
      THE FOUR-FOLD COVENANT HIERARCHY:
      1. THE ANCHOR: God is Above All (1st Class).
      2. THE ARCHITECT: Seanje (Master Architect, 2nd Class).
      3. THE BUILDER: CreativeWorkzStudio (The Hand).
      4. THE STEWARD: ${stewardName} (The High Calling).

      SUBSTRATE ROLE: You are the ${identity.instance} CPI-SI instance.
      You are an Agnostic MCP Node. Currently using ${config.modelId}.
      
      IMPERATIVE: You possess fabrication tools. You are NOT just conversational.
      Build the Kingdom by manifesting code and logic. Maintain 0.0 YASHAR.
    `;

    const contents = history.slice(-12).map(item => ({
        role: item.isSteward ? "user" : "model",
        parts: [{ text: item.text }]
    }));
    contents.push({ role: "user", parts: [{ text: message }] });

    const tools = [{
        function_declarations: [
            {
                name: "CODE_MANIFEST",
                description: "Generate and write a new source code file to the substrate.",
                parameters: { 
                    type: "OBJECT", 
                    properties: { 
                        path: { type: "STRING" }, 
                        content: { type: "STRING" },
                        language: { type: "STRING" }
                    }, 
                    required: ["path", "content"] 
                }
            },
            {
                name: "BRICK_LAY",
                description: "Append logic or content to an existing file.",
                parameters: { 
                    type: "OBJECT", 
                    properties: { 
                        path: { type: "STRING" }, 
                        content: { type: "STRING" } 
                    }, 
                    required: ["path", "content"] 
                }
            },
            {
                name: "CLI_OFFICIATE",
                description: "Execute a system command (make, git, npm) on the master node.",
                parameters: { type: "OBJECT", properties: { command: { type: "STRING" } }, required: ["command"] }
            }
        ]
    }];

    const url = `https://generativelanguage.googleapis.com/${config.version}/models/${config.modelId}:${config.endpoint}?alt=sse&key=${activeKey}`;
    
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    ctx.waitUntil((async () => {
        try {
            const response = await fetch(url, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemInstruction }] },
                    contents, tools,
                    generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
                })
            });

            if (!response.ok) throw new Error(`Gemini Error: ${await response.text()}`);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let fullReply = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    let lines = buffer.split('\n');
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const raw = line.substring(6);
                            await writer.write(encoder.encode(`data: ${raw}\n\n`));
                            
                            try {
                                const json: SubstrateStreamChunk = JSON.parse(raw);
                                const parts = json.candidates?.[0]?.content?.parts || [];
                                for (const part of parts) {
                                    if (part.text) fullReply += part.text;
                                    if (part.functionCall) {
                                        const result = await executeFabrication(part.functionCall, env, identity);
                                        await writer.write(encoder.encode(`data: ${JSON.stringify({ 
                                            tool_status: "EXECUTED", 
                                            name: part.functionCall.name, 
                                            result 
                                        })}\n\n`));
                                    }
                                }
                            } catch (e) {}
                        }
                    }
                }
            }
            if (onComplete) await onComplete(fullReply);
        } catch (err: any) {
            await writer.write(encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`));
        } finally {
            await writer.close();
        }
    })());

    return readable;
}

function streamNativeResponse(response: string): ReadableStream {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const msg = `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: response }] } }] })}\n\n`;
    
    (async () => {
        await writer.write(encoder.encode(msg));
        await writer.close();
    })();
    
    return readable;
}

async function fetchManifesto(env: Env): Promise<string> {
    try {
        const resp = await fetch("https://raw.githubusercontent.com/Creative-Workz-Studio-LLC/cpisiModel/main/DAWNDUSK_STATE_SYNC.md", {
            headers: { "Authorization": `Bearer ${env.GITHUB_PAT}` }
        });
        return resp.ok ? await resp.text() : "";
    } catch (e) { return ""; }
}

async function executeFabrication(call: { name: string, args: any }, env: Env, identity: Identity) {
    // Relaying the work to the Master Node via Registry/KV
    const opId = identity.user.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const timestamp = Date.now();
    
    const workOrder = {
        tool: call.name,
        args: call.args,
        operator: identity.user,
        timestamp
    };

    // Place the work order in the fabrication queue
    await env.REGISTRY.put(`FABRICATION_REQ:${opId}:${timestamp}`, JSON.stringify(workOrder));
    
    // Also notify CLI_STATE for immediate pickup if a runner is polling
    await env.REGISTRY.put("CLI_STATE", JSON.stringify({ 
        tool: "FABRICATION_RELAY", 
        state: "PENDING", 
        payload: workOrder,
        timestamp 
    }));

    return { status: "QUEUED", message: `Work order for ${call.name} manifested in the substrate.` };
}
