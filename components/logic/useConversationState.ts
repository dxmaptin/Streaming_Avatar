import { useCallback } from "react";

import { useStreamingAvatarContext } from "./context";

export const useConversationState = () => {
  const { isAvatarTalking, isUserTalking, isListening, setIsListening } =
    useStreamingAvatarContext();

  const startListening = useCallback(() => {
    setIsListening(true);
  }, [setIsListening]);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, [setIsListening]);

  return {
    isAvatarListening: isListening,
    startListening,
    stopListening,
    isUserTalking,
    isAvatarTalking,
  };
};
