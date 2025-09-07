import { useCallback } from "react";

import { useStreamingAvatarContext } from "./context";

export const useInterrupt = () => {
  const { avatarRef } = useStreamingAvatarContext();

  const interrupt = useCallback(() => {
    if (!avatarRef.current) return;
    if (typeof avatarRef.current.interruptPersona === "function") {
      avatarRef.current.interruptPersona();
    } else if (typeof avatarRef.current.interrupt === "function") {
      avatarRef.current.interrupt();
    }
  }, [avatarRef]);

  return { interrupt };
};
