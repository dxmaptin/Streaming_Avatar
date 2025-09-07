"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent, createLocalAudioTrack } from "livekit-client";
import { Button } from "./Button";
import { Input } from "./Input";
import { useStreamingAvatarContext } from "./logic/context";

export const LiveKitJoin: React.FC = () => {
  const [roomName, setRoomName] = useState<string>("demo");
  const [identity, setIdentity] = useState<string>(
    `user-${Math.random().toString(36).slice(2, 8)}`,
  );
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const roomRef = useRef<Room | null>(null);
  const { micStream } = useStreamingAvatarContext();

  const connect = useCallback(async () => {
    if (connected || connecting) return;
    setConnecting(true);
    try {
      const resp = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, identity }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      const { token } = await resp.json();
      const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || process.env.LIVEKIT_WS_URL;
      if (!wsUrl) throw new Error("Missing LIVEKIT_WS_URL env");

      const room = new Room();
      roomRef.current = room;
      room.on(RoomEvent.Disconnected, () => setConnected(false));
      await room.connect(wsUrl, token);
      setConnected(true);

      // Publish mic audio; reuse Anam's mic stream if available
      let track;
      if (micStream && micStream.getAudioTracks().length > 0) {
        const audioTrack = micStream.getAudioTracks()[0];
        track = await createLocalAudioTrack({ deviceId: audioTrack.getSettings().deviceId });
      } else {
        track = await createLocalAudioTrack();
      }
      await room.localParticipant.publishTrack(track);
    } catch (e) {
      console.error("LiveKit connect error", e);
    } finally {
      setConnecting(false);
    }
  }, [roomName, identity, micStream, connected, connecting]);

  const disconnect = useCallback(async () => {
    try {
      await roomRef.current?.disconnect();
    } catch {}
    setConnected(false);
  }, []);

  useEffect(() => {
    return () => {
      try { roomRef.current?.disconnect(); } catch {}
    };
  }, []);

  return (
    <div className="glass rounded-2xl border border-white/10 p-3 flex flex-col gap-2">
      <div className="text-sm text-zinc-200">LiveKit</div>
      <div className="flex gap-2">
        <Input placeholder="Room" value={roomName} onChange={setRoomName} />
        <Input placeholder="Identity" value={identity} onChange={setIdentity} />
        {connected ? (
          <Button onClick={disconnect} className="bg-red-600/80">Leave</Button>
        ) : (
          <Button onClick={connect} disabled={connecting}>
            {connecting ? "Joining..." : "Join"}
          </Button>
        )}
      </div>
    </div>
  );
};

