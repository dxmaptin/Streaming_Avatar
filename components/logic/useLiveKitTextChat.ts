import { useCallback } from "react";

export const useLiveKitTextChat = (roomRef: React.RefObject<any>) => {
  const sendMessage = useCallback(
    (message: string) => {
      const room = roomRef?.current;
      if (!room) {
        console.error("Room not connected");
        return;
      }

      try {
        // Send text message through LiveKit data channel
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify({
          type: "user_message",
          text: message,
          timestamp: Date.now()
        }));
        
        // Send to all participants (the agent will receive this)
        room.localParticipant.publishData(data, {
          reliable: true,
          topic: "chat"
        });
        
        console.log("📤 Text message sent via LiveKit:", message);
      } catch (error) {
        console.error("❌ Failed to send text message:", error);
      }
    },
    [roomRef],
  );

  const sendMessageSync = useCallback(
    async (message: string) => {
      sendMessage(message);
      // For now, just return immediately since LiveKit data channels don't have sync responses
      return Promise.resolve();
    },
    [sendMessage],
  );

  const repeatMessage = useCallback(
    (message: string) => {
      // For "repeat" functionality, we can send a special command to the agent
      const room = roomRef?.current;
      if (!room) return;

      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify({
          type: "repeat_message",
          text: message,
          timestamp: Date.now()
        }));
        
        room.localParticipant.publishData(data, {
          reliable: true,
          topic: "chat"
        });
        
        console.log("📤 Repeat message sent via LiveKit:", message);
      } catch (error) {
        console.error("❌ Failed to send repeat message:", error);
      }
    },
    [roomRef],
  );

  const repeatMessageSync = useCallback(
    async (message: string) => {
      repeatMessage(message);
      return Promise.resolve();
    },
    [repeatMessage],
  );

  return {
    sendMessage,
    sendMessageSync,
    repeatMessage,
    repeatMessageSync,
  };
};