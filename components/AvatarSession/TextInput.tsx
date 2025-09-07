import React, { useCallback, useEffect, useState } from "react";
import { usePrevious } from "ahooks";

import { Select } from "../Select";
import { Button } from "../Button";
import { SendIcon } from "../Icons";
import { useLiveKitTextChat } from "../logic/useLiveKitTextChat";
import { Input } from "../Input";
import { useConversationState } from "../logic/useConversationState";

export const TextInput: React.FC<{ roomRef: React.RefObject<any> }> = ({ roomRef }) => {
  const { sendMessage, sendMessageSync, repeatMessage, repeatMessageSync } =
    useLiveKitTextChat(roomRef);
  const { startListening, stopListening } = useConversationState();
  const [message, setMessage] = useState("");

  const handleSend = useCallback(() => {
    if (message.trim() === "") {
      return;
    }
    // Send message through LiveKit data channel to the Python agent
    sendMessage(message);
    setMessage("");
  }, [
    message,
    sendMessage,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleSend();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSend]);

  const previousText = usePrevious(message);

  useEffect(() => {
    if (!previousText && message) {
      startListening();
    } else if (previousText && !message) {
      stopListening();
    }
  }, [message, previousText, startListening, stopListening]);

  return (
    <div className="flex flex-row gap-2 items-end w-full">
      <Input
        className="min-w-[500px]"
        placeholder={`Type something for the avatar to respond...`}
        value={message}
        onChange={setMessage}
      />
      <Button className="!p-2" onClick={handleSend}>
        <SendIcon size={20} />
      </Button>
    </div>
  );
};
