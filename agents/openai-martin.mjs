// OpenAI Realtime voice agent (Martin) using LiveKit Agents
// Run as a worker with env LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, OPENAI_API_KEY
// Optionally set LIVEKIT_AGENT_NAME and OPENAI_REALTIME_MODEL.

import { cli, WorkerOptions, defineAgent, voice } from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import { fileURLToPath } from "node:url";

// Default agent instructions
const defaultInstructions =
  process.env.AGENT_INSTRUCTIONS ||
  "You are a concise, friendly voice assistant. Keep replies short and helpful.";

// Define the agent entry
export default defineAgent({
  entry: async (ctx) => {
    // Connect to the assigned room (from job/dispatch or simulation)
    await ctx.connect();

    const agent = new voice.Agent({
      instructions: defaultInstructions,
    });

    const model = process.env.OPENAI_REALTIME_MODEL || "gpt-4o-realtime-preview";
    const voiceName = process.env.OPENAI_VOICE || "martin";

    const session = new voice.AgentSession({
      // Use OpenAI Realtime for end-to-end STT+LLM+TTS
      llm: new openai.realtime.RealtimeModel({
        model,
        voice: voiceName,
        // temperature: 0.8, // default
        // turn_detection: { type: "server_vad", silence_duration_ms: 500 }, // defaults are fine
      }),
    });

    await session.start({ agent, room: ctx.room });

    // Optional: send a short greeting once connected
    await session.generateReply({ instructions: "Introduce yourself briefly to the user." });
  },
});

// If executed directly, expose the CLI worker runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const agentName = process.env.LIVEKIT_AGENT_NAME || "openai-martin";
  cli.runApp(
    new WorkerOptions({
      agent: fileURLToPath(import.meta.url),
      agentName,
      // LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET are read from env by the Worker
    })
  );
}

