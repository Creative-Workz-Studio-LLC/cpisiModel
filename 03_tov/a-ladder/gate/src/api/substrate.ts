/**
 * SUBSTRATE API: Robust streaming logic for the CPISI model
 */
import { SubstrateStreamChunk } from "../types/index.ts";

export const streamRevelation = async (
    url: string, 
    payload: any, 
    onChunk: (text: string) => void,
    onComplete: (fullText: string) => void,
    onError: (error: string) => void,
    onToolStatus?: (status: string, toolName: string, result: any) => void
) => {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        if (!response.body) throw new Error("Response body is null");

        const reader = response.body
            .pipeThrough(new TextDecoderStream())
            .getReader();

        let fullReply = "";
        let buffer = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += value;
            const lines = buffer.split('\n');
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (!line.trim()) continue;
                
                // Handle SSE format "data: {...}"
                let jsonString = line;
                if (line.startsWith('data: ')) {
                    jsonString = line.substring(6);
                }

                try {
                    const json: any = JSON.parse(jsonString);

                    if (json.error) {
                        onError(json.error);
                        return;
                    }

                    if (json.tool_status) {
                        if (onToolStatus) {
                            onToolStatus(json.tool_status, json.name, json.result);
                        }
                        continue;
                    }

                    const part = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    if (part) {
                        fullReply += part;
                        onChunk(fullReply);
                    }
                } catch (e) {
                    // Silently ignore partial/invalid JSON in stream
                }
            }
        }

        onComplete(fullReply);

    } catch (err: any) {
        onError(err.message || "Dissonance in the stream");
    }
};
