"use client";
import { useCallback, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  RemoteTrackPublication,
  RemoteParticipant,
  RemoteTrack,
  RemoteVideoTrack,
  Track,
  createLocalAudioTrack,
} from "livekit-client";

type StartOptions = {
  roomName?: string;
  identity?: string;
  agentName?: string; // worker name to dispatch (e.g., openai-martin-bey)
  avatarParticipantIdentity?: string; // defaults to bey-avatar-agent
};

export function useLiveKitBeyViewer() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const roomRef = useRef<Room | null>(null);

  const start = useCallback(async (opts: StartOptions = {}) => {
    try {
      setIsConnecting(true);
      setError(null);

      const roomName = opts.roomName || `avatar-session-${Date.now()}`;
      const identity = opts.identity || `user-${Math.random().toString(36).slice(2, 8)}`;
      // Use a client-exposed env for agent name; fall back to Python worker name
      const agentName =
        opts.agentName || process.env.NEXT_PUBLIC_AGENT_NAME || "openai-martin-bey";
      const avatarIdentity = opts.avatarParticipantIdentity || "bey-avatar-agent";

      console.log("🚀 Starting LiveKit session:", { roomName, identity, agentName, avatarIdentity });

      // 1) LiveKit token
      console.log("🔑 Requesting LiveKit token...");
      const tResp = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, identity }),
      });
      if (!tResp.ok) {
        const errorText = await tResp.text();
        console.error("❌ Token request failed:", errorText);
        throw new Error(`Token request failed: ${errorText}`);
      }
      const { token } = await tResp.json();
      console.log("✅ Token received successfully");

      const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || process.env.LIVEKIT_WS_URL;
      if (!wsUrl) throw new Error("Missing LIVEKIT_WS_URL");
      console.log("🌐 Connecting to WebSocket:", wsUrl);

      // 2) Connect
      const room = new Room();
      roomRef.current = room;
      
      // Add comprehensive room event listeners
      room.on(RoomEvent.Connected, () => {
        console.log("✅ Room connected successfully");
      });
      
      room.on(RoomEvent.Disconnected, (reason) => {
        console.log("🔌 Room disconnected:", reason);
        setIsConnected(false);
      });

      room.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log("👥 Participant joined:", participant.identity, participant.name);
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        console.log("👋 Participant left:", participant.identity);
      });

      room.on(RoomEvent.TrackPublished, (publication, participant) => {
        console.log("📤 Track published:", {
          participant: participant.identity,
          kind: publication.kind,
          source: publication.source
        });
      });

      room.on(RoomEvent.TrackUnpublished, (publication, participant) => {
        console.log("📤❌ Track unpublished:", {
          participant: participant.identity,
          kind: publication.kind
        });
      });

      await room.connect(wsUrl, token);

      // 3) Publish mic
      console.log("🎤 Requesting microphone access...");
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("✅ Microphone access granted");
      const deviceId = mic.getAudioTracks()[0]?.getSettings()?.deviceId;
      const localTrack = await createLocalAudioTrack(deviceId ? { deviceId } : undefined);
      await room.localParticipant.publishTrack(localTrack);
      console.log("📤 Microphone track published");

      // 4) Discover avatar video track
      const subscribeIfAvatar = (track: RemoteTrack, pub: RemoteTrackPublication, participant: RemoteParticipant) => {
        try {
          console.log("🔍 Checking track:", {
            participantIdentity: participant.identity,
            expectedIdentity: avatarIdentity,
            trackKind: pub.kind,
            trackSource: pub.source
          });

          if (participant.identity !== avatarIdentity) {
            console.log("⏭️  Skipping track - not avatar participant");
            return;
          }
          
          if (pub.kind !== Track.Kind.Video) {
            console.log("⏭️  Skipping track - not video");
            return;
          }

          console.log("🎥 Found avatar video track!");
          const vTrack = track as RemoteVideoTrack;
          const media: MediaStreamTrack | undefined = (vTrack as any)?.mediaStreamTrack;
          
          if (!media) {
            console.error("❌ No media stream track available");
            return;
          }

          console.log("✅ Creating video stream from track");
          const stream = new MediaStream();
          stream.addTrack(media);
          setVideoStream(stream);
          setIsConnected(true);
          console.log("🎉 Video stream set successfully!");
        } catch (e) {
          console.error("❌ Avatar subscribe error:", e);
        }
      };

      room.on(RoomEvent.TrackSubscribed, (track, pub, participant) => {
        console.log("📥 Track subscribed:", {
          participant: participant.identity,
          kind: pub.kind,
          source: pub.source
        });
        subscribeIfAvatar(track, pub, participant);
      });

      // Also scan existing publications if any
      console.log("🔍 Scanning existing participants...");
      room.remoteParticipants.forEach((p) => {
        console.log("👤 Existing participant:", p.identity, "tracks:", p.trackPublications.size);
        p.trackPublications.forEach((pub) => {
          const track = pub.track as RemoteTrack | undefined;
          if (track) {
            console.log("📹 Existing track found:", pub.kind, pub.source);
            subscribeIfAvatar(track, pub, p);
          }
        });
      });

      // 5) Dispatch the Python worker agent to join the room
      console.log("🤖 Dispatching agent:", agentName);
      const dResp = await fetch("/api/livekit/agent/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, agentName }),
      });
      
      if (!dResp.ok) {
        const errorText = await dResp.text();
        console.error("❌ Agent dispatch failed:", errorText);
        // Don't throw here - agent might already be running
      } else {
        const dispatchResult = await dResp.json();
        console.log("✅ Agent dispatched successfully:", dispatchResult);
      }

      console.log("🎯 Setup complete. Waiting for avatar to join and publish video...");
      return { room };
    } catch (e: any) {
      console.error("❌ useLiveKitBeyViewer start error:", e);
      setError(e?.message || String(e));
      throw e;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      console.log("🛑 Stopping LiveKit session...");
      await roomRef.current?.disconnect();
      roomRef.current = null;
      setVideoStream(null);
      setIsConnected(false);
      console.log("✅ LiveKit session stopped successfully");
    } catch (e) {
      console.error("❌ Stop error:", e);
    }
  }, []);

  return { isConnecting, isConnected, error, start, stop, videoStream, roomRef };
}
