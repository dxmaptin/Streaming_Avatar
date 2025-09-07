import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

export async function POST(req: NextRequest) {
  try {
    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      return new Response("Missing LiveKit server credentials", { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const roomName = body.roomName || "default";
    const identity = body.identity || `user-${Math.random().toString(36).slice(2, 8)}`;
    const name = body.name || identity;

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      name,
    });
    at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });

    const token = await at.toJwt();
    return NextResponse.json({ token }, { status: 200 });
  } catch (e) {
    console.error("/api/livekit/token error", e);
    return new Response("Internal Server Error", { status: 500 });
  }
}
