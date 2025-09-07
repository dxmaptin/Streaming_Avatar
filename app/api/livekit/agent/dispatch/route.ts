import { NextRequest, NextResponse } from "next/server";
import { AgentDispatchClient } from "livekit-server-sdk";

function deriveHttpHostFromWs(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol.startsWith("ws")) {
      u.protocol = u.protocol.replace("ws", "http");
    }
    // drop path to just origin
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { roomName, agentName, metadata } = await req.json();
    if (!roomName) {
      return new Response("Missing roomName", { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    if (!apiKey || !apiSecret) {
      return new Response("Missing LiveKit API credentials", { status: 500 });
    }

    const host =
      process.env.LIVEKIT_HOST ||
      deriveHttpHostFromWs(process.env.LIVEKIT_URL) ||
      deriveHttpHostFromWs(process.env.LIVEKIT_WS_URL) ||
      deriveHttpHostFromWs(process.env.NEXT_PUBLIC_LIVEKIT_WS_URL);
    if (!host) {
      return new Response("Missing LiveKit host (set LIVEKIT_HOST or LIVEKIT_URL)", { status: 500 });
    }

    const client = new AgentDispatchClient(host, apiKey, apiSecret);
    const name = agentName || process.env.LIVEKIT_AGENT_NAME || "openai-martin";
    const dispatch = await client.createDispatch(roomName, name, {
      metadata: metadata ? String(metadata) : undefined,
    });

    return NextResponse.json({ dispatch }, { status: 200 });
  } catch (e: any) {
    console.error("/api/livekit/agent/dispatch error", e);
    return new Response(e?.message || "Internal Server Error", { status: 500 });
  }
}

