import { createClient, AnamEvent, MessageRole } from "@anam-ai/js-sdk";
import React, { useCallback } from "react";

import {
  StreamingAvatarSessionState,
  useStreamingAvatarContext,
} from "./context";
import { useVoiceChat } from "./useVoiceChat";
import { useMessageHistory } from "./useMessageHistory";

export const useStreamingAvatarSession = () => {
  const {
    avatarRef,
    basePath,
    sessionState,
    setSessionState,
    stream,
    setStream,
    setMicStream,
    setIsListening,
    setIsUserTalking,
    setIsAvatarTalking,
    setConnectionQuality,
    handleUserTalkingMessage,
    handleStreamingTalkingMessage,
    handleEndMessage,
    clearMessages,
    isVoiceChatActive,
    suppressNextUserMessage,
    setSuppressNextUserMessage,
  } = useStreamingAvatarContext();
  const { stopVoiceChat } = useVoiceChat();
  const dropRemainingRef = React.useRef<number>(0);

  useMessageHistory();

  const init = useCallback(
    (token: string) => {
      console.log("Anam: Initializing client with token");
      // Anam SDK: create client from session token
      avatarRef.current = createClient(token);
      console.log("Anam: Client created:", avatarRef.current);
      return avatarRef.current;
    },
    [avatarRef],
  );

  const handleStream = useCallback(
    (videoStream: MediaStream) => {
      setStream(videoStream);
      setSessionState(StreamingAvatarSessionState.CONNECTED);
    },
    [setSessionState, setStream],
  );

  const stop = useCallback(async () => {
    try {
      // Anam SDK: remove listeners if present
      avatarRef.current?.removeListener(AnamEvent.VIDEO_STREAM_STARTED, handleStream as any);
    } catch {}
    clearMessages();
    stopVoiceChat();
    setIsListening(false);
    setIsUserTalking(false);
    setIsAvatarTalking(false);
    setStream(null);
    try {
      await avatarRef.current?.stopStreaming?.();
    } catch {}
    setSessionState(StreamingAvatarSessionState.INACTIVE);
  }, [
    handleStream,
    setSessionState,
    setStream,
    avatarRef,
    setIsListening,
    stopVoiceChat,
    clearMessages,
    setIsUserTalking,
    setIsAvatarTalking,
  ]);

  const start = useCallback(
    async (config: any, token?: string) => {
      if (sessionState !== StreamingAvatarSessionState.INACTIVE) {
        throw new Error("There is already an active session");
      }

      if (!avatarRef.current) {
        if (!token) {
          throw new Error("Token is required");
        }
        init(token);
      }

      if (!avatarRef.current) {
        throw new Error("Avatar is not initialized");
      }

      setSessionState(StreamingAvatarSessionState.CONNECTING);
      // Anam SDK listeners
      avatarRef.current.addListener(AnamEvent.CONNECTION_ESTABLISHED, () => {
        console.log("Anam: Connection established");
      });
      avatarRef.current.addListener(AnamEvent.CONNECTION_CLOSED, () => {
        console.log("Anam: Connection closed");
        stop();
      });
      avatarRef.current.addListener(AnamEvent.VIDEO_STREAM_STARTED, (video: MediaStream) => {
        console.log("Anam: Video stream started", video);
        handleStream(video);
      });
      avatarRef.current.addListener(AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED, (evt: any) => {
        const role: MessageRole = evt.role;
        const payload = { detail: { message: evt.content } } as any;
        if (role === MessageRole.USER) {
          return handleUserTalkingMessage(payload);
        } else {
          return handleStreamingTalkingMessage(payload);
        }
        // end-of-speech handling
        // When endOfSpeech is true, mark message as finished
        // and reset any suppression flags
      });
      avatarRef.current.addListener(AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED, (evt: any) => {
        if (evt?.endOfSpeech) {
          handleEndMessage();
        }
      });
      avatarRef.current.addListener(AnamEvent.SERVER_WARNING, (warning: any) => {
        console.warn("Anam server warning:", warning);
      });

      // Add error listener
      if (avatarRef.current.addListener) {
        avatarRef.current.addListener('error', (error: any) => {
          console.error("Anam SDK error:", error);
        });
      }

      // Capture microphone (always), then mute/unmute based on voice chat toggle
      const mic = await navigator.mediaDevices
        .getUserMedia({ audio: true })
        .catch(() => undefined);
      if (setMicStream) setMicStream(mic || null);

      try {
        // Start streaming. Returns [videoStream, audioStream?]
        console.log("Anam: Attempting streamToVideoElement");
        await avatarRef.current.streamToVideoElement?.("anam-video", mic);
        console.log("Anam: streamToVideoElement successful");
      } catch (error) {
        console.log("Anam: streamToVideoElement failed, trying fallback:", error);
        // Fallback: get streams directly then attach in UI via context
        try {
          const streams: MediaStream[] = (await avatarRef.current.stream(mic)) || [];
          console.log("Anam: Direct stream call returned:", streams);
          if (streams[0]) handleStream(streams[0]);
        } catch (fallbackError) {
          console.error("Anam: Both streaming methods failed:", fallbackError);
          throw fallbackError;
        }
      }

      // Apply initial mute state: if voice chat is not active, mute input
      if (!isVoiceChatActive) {
        try { avatarRef.current.muteInputAudio(); } catch {}
      } else {
        try { avatarRef.current.unmuteInputAudio(); } catch {}
      }

      return avatarRef.current as any;
    },
    [
      init,
      handleStream,
      stop,
      setSessionState,
      avatarRef,
      sessionState,
      handleUserTalkingMessage,
      handleStreamingTalkingMessage,
      handleEndMessage,
      isVoiceChatActive,
      setMicStream,
    ],
  );

  return {
    avatarRef,
    sessionState,
    stream,
    initAvatar: init,
    startAvatar: start,
    stopAvatar: stop,
  };
};
