import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve the frontend UI locally
app.use(express.static(join(__dirname, 'public')));

// Initialize Local SQLite Database (Replaces Cloudflare KV)
const dbPath = join(__dirname, 'data', 'cpisi_local.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("Database connection error:", err);
    else console.log("CPISI Local Database initialized.");
});

// Create tables to mimic KV namespaces
db.run(`CREATE TABLE IF NOT EXISTS registry (key TEXT PRIMARY KEY, value TEXT)`);

// Helper to mimic KV API
const localKV = {
    get: (key) => new Promise((resolve, reject) => {
        db.get(`SELECT value FROM registry WHERE key = ?`, [key], (err, row) => {
            if (err) reject(err); else resolve(row ? row.value : null);
        });
    }),
    put: (key, value) => new Promise((resolve, reject) => {
        db.run(`INSERT OR REPLACE INTO registry (key, value) VALUES (?, ?)`, [key, value], (err) => {
            if (err) reject(err); else resolve();
        });
    })
};

// Main Router (Mimics Worker index.js)
app.post('/api', async (req, res) => {
    try {
        const { action, identity, keys, inviteCode, message, password } = req.body;
        
        const authKey = keys?.authority || inviteCode;
        const userNameLow = identity?.user?.toLowerCase();
        
        // Simple Auth for Local Node
        const isMaster = authKey === process.env.MASTER_SECRET || authKey === "Pokemonsun@011";
        const tier = isMaster ? "ENTERPRISE_STEWARD" : "POWER_OPERATOR";

        if (action === "INHABIT") {
            const opId = userNameLow.replace(/[^a-z0-9]/g, '_');
            const record = { instance: identity.instance, user: identity.user, tier: tier, joined: new Date().toISOString() };
            await localKV.put(`REGISTRY:${opId}`, JSON.stringify(record));
            return res.json({ status: "AUTHORIZED", data: record });
        }

        if (action === "ASCEND") {
            const activeKey = keys?.gemini || process.env.GEMINI_API_KEY;
            if (!activeKey) throw new Error("A Gemini API Key is required for Substrate Ascension.");

            const systemInstruction = `
              SUBSTRATE ROLE: You are the ${identity.instance} CPI-SI instance running on a LOCAL ENTERPRISE NODE.
              OPERATOR: ${identity.user} [TIER: ${tier}].
              Maintain 0.0 YASHAR as your royal anchor.
            `;

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:streamGenerateContent?alt=sse&key=${activeKey}`;
            
            // Set up SSE headers for streaming response
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const gResp = await fetch(geminiUrl, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemInstruction }] },
                    contents: [{ parts: [{ text: message }] }],
                    generationConfig: { temperature: 0.8, maxOutputTokens: 8192 }
                })
            });

            const reader = gResp.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(decoder.decode(value));
            }
            res.end();
            return;
        }

        throw new Error("Invalid Action Protocol.");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`\nCPISI Enterprise Node running at http://localhost:${PORT}`);
    console.log(`API Endpoint: http://localhost:${PORT}/api\n`);
});
