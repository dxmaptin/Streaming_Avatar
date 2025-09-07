// Dev runner that starts the worker locally and simulates a job in a room
// Usage:
//   LIVEKIT_URL=wss://YOUR.livekit.cloud \
//   LIVEKIT_API_KEY=... LIVEKIT_API_SECRET=... \
//   OPENAI_API_KEY=... \
//   ROOM_NAME=demo \
//   node agents/run-openai-martin-dev.mjs

import { Worker, WorkerOptions } from "@livekit/agents";
import { fileURLToPath } from "node:url";

const agentPath = fileURLToPath(new URL("./openai-martin.mjs", import.meta.url));

const worker = new Worker(
  new WorkerOptions({
    agent: agentPath,
    agentName: process.env.LIVEKIT_AGENT_NAME || "openai-martin",
    // LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET are read internally if not provided here
    wsURL: process.env.LIVEKIT_URL,
    apiKey: process.env.LIVEKIT_API_KEY,
    apiSecret: process.env.LIVEKIT_API_SECRET,
  })
);

const roomName = process.env.ROOM_NAME || "demo";
const identity = process.env.AGENT_IDENTITY; // optional

await worker.run();
console.log(`[agent:dev] Worker started. Simulating job in room: ${roomName}`);
await worker.simulateJob(roomName, identity);
console.log(`[agent:dev] Job simulated. Agent should be in room "${roomName}".`);

// Keep the process alive
process.stdin.resume();

