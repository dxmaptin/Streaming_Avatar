import { useCallback } from "react";

import { useStreamingAvatarContext } from "./context";

export const useTextChat = () => {
  const { avatarRef, promptPrefix } = useStreamingAvatarContext();

  const sendMessage = useCallback(
    (message: string) => {
      if (!avatarRef.current) return;
      const text = promptPrefix ? `${promptPrefix}\n\nUser: ${message}` : message;
      // Anam SDK: send a user message into the current session
      try {
        avatarRef.current.sendUserMessage?.(text);
      } catch {}
    },
    [avatarRef, promptPrefix],
  );

  const sendMessageSync = useCallback(
    async (message: string) => {
      if (!avatarRef.current) return;
      const text = promptPrefix ? `${promptPrefix}\n\nUser: ${message}` : message;
      try {
        return await avatarRef.current?.sendUserMessage?.(text);
      } catch {}
    },
    [avatarRef, promptPrefix],
  );

  const repeatMessage = useCallback(
    (message: string) => {
      if (!avatarRef.current) return;
      // For Anam, to make the persona speak literal content, use talk()
      try {
        return avatarRef.current?.talk?.(message);
      } catch {}
    },
    [avatarRef],
  );

  const repeatMessageSync = useCallback(
    async (message: string) => {
      if (!avatarRef.current) return;
      try {
        return await avatarRef.current?.talk?.(message);
      } catch {}
    },
    [avatarRef],
  );

  return {
    sendMessage,
    sendMessageSync,
    repeatMessage,
    repeatMessageSync,
  };
};
