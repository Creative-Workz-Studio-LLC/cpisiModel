// worker/src/services/chronicles.ts
import { Env } from "../types.ts";

export async function fetchLatestChronicle(env: Env): Promise<any> {
    try {
        const resp = await fetch("https://raw.githubusercontent.com/Creative-Workz-Studio-LLC/cpisiModel/main/00_THE_WORD/chronicles/today.adoc", {
            headers: { "Authorization": `Bearer ${env.GITHUB_PAT}` }
        });
        
        if (!resp.ok) return null;
        const text = await resp.text();
        
        // Simple adoc parser for the entrance preview
        return {
            title: text.match(/^# (.*)/)?.[1] || "Untitled Chronicle",
            date: text.match(/:date: (.*)/)?.[1] || "",
            summary: text.match(/## 1\. THE DAILY SUMMARY\n([\s\S]*?)\n\n/)?.[1] || ""
        };
    } catch (e) {
        return null;
    }
}
