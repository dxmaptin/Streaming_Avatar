"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMemoizedFn, useUnmount } from "ahooks";

import { Button } from "./Button";
import { AvatarConfig } from "./AvatarConfig";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { LoadingIcon } from "./Icons";
import { DEFAULT_AVATAR_ID } from "@/app/lib/presets";
import { GiftOverlay } from "./gifting/GiftOverlay";
import { useLiveKitBeyViewer } from "./logic/useLiveKitBeyViewer";

// Minimal config shape we care about for Anam
type MinimalConfig = {
  avatarName: string;
  voice?: { voiceId?: string };
  language?: string;
  knowledgeId?: string;
};

const DEFAULT_CONFIG: MinimalConfig = {
  avatarName: "",
  voice: { voiceId: undefined },
  language: "en",
};

export function InteractiveAvatar() {
  // Use Beyond Presence, initiated from LiveKit
  const { isConnecting, isConnected, error: integrationError, videoStream, start, stop, roomRef } = useLiveKitBeyViewer();
  
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<MinimalConfig>({
    ...DEFAULT_CONFIG,
    avatarName: DEFAULT_AVATAR_ID || DEFAULT_CONFIG.avatarName,
  });
  const [showConfig, setShowConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoStreamLocal, setVideoStreamLocal] = useState<MediaStream | null>(null);

  const mediaStream = useRef<HTMLVideoElement>(null);

  // Apply query param overrides for avatar/voice once
  useEffect(() => {
    const avatarId = searchParams?.get("avatarId");
    const voiceId = searchParams?.get("voiceId");
    if (avatarId || voiceId) {
      setConfig((prev) => ({
        ...prev,
        avatarName: avatarId || prev.avatarName,
        voice: { ...(prev.voice || {}), voiceId: voiceId || prev.voice?.voiceId },
      }));
    }
  }, [searchParams]);

  const startSession = useMemoizedFn(async (_isVoiceChat: boolean) => {
    try {
      setError(null);
      // Start LiveKit + dispatch agent
      await start({ roomName: `avatar-${Date.now()}` });
      console.log("Session started; waiting for remote media...");
    } catch (error: any) {
      console.error("Error starting avatar session:", error);
      const msg = error?.message || String(error) || "Unknown error";
      setError(`Failed to start stream: ${msg}`);
    }
  });

  const stopSession = useMemoizedFn(async () => {
    try {
      await stop();
      setVideoStreamLocal(null);
    } catch (error) {
      console.error("Error stopping session:", error);
    }
  });

  useUnmount(() => {
    stopSession();
  });

  useEffect(() => {
    const vs = videoStream || videoStreamLocal;
    if (vs && mediaStream.current) {
      mediaStream.current.srcObject = vs;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, videoStream, videoStreamLocal]);

  // Determine session state for UI
  const sessionState = isConnecting ? "CONNECTING" : (isConnected ? "CONNECTED" : "INACTIVE");

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-col rounded-2xl glass glow-ring overflow-hidden border border-white/10">
        <div className="relative w-full min-h-[64vh] md:min-h-[74vh] overflow-hidden flex items-center justify-center bg-black/40">
          {sessionState !== "INACTIVE" ? (
            <>
              <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_25%_10%,_white_2px,transparent_2px)] bg-[length:24px_24px]" />
              <AvatarVideo ref={mediaStream} isConnected={isConnected} onStop={stopSession} />
              <GiftOverlay />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Button
                  className="px-8 py-3 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-2))]"
                  onClick={() => startSession(true)}
                >
                  Start Live Stream
                </Button>
                {(error || integrationError) && (
                  <p className="text-xs text-red-400">{error || integrationError}</p>
                )}
                <button
                  className="text-xs text-zinc-300 hover:text-white underline underline-offset-4"
                  onClick={() => setShowConfig((v) => !v)}
                >
                  {showConfig ? "Hide Configuration" : "Configure"}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 items-center justify-center p-4 border-t border-white/10 w-full">
          {sessionState === "CONNECTED" ? (
            <div className="flex gap-2">
              <AvatarControls roomRef={roomRef} />
              <Button
                className="px-4 py-2 bg-red-600/80"
                onClick={stopSession}
              >
                Stop Stream
              </Button>
            </div>
          ) : sessionState === "INACTIVE" ? (
            showConfig ? (
              <div className="w-full max-w-[700px]">
                <AvatarConfig config={config} onConfigChange={setConfig} />
              </div>
            ) : (
              <div className="text-xs text-zinc-400">Use Configure to adjust model, voice, and STT options.</div>
            )
          ) : (
            <LoadingIcon className="text-zinc-300" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function InteractiveAvatarWrapper() {
  return <InteractiveAvatar />;
}
