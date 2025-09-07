import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import React from "react";

import { useVoiceChat } from "../logic/useVoiceChat";
import { Button } from "../Button";
import { useInterrupt } from "../logic/useInterrupt";

import { AudioInput } from "./AudioInput";
import { TextInput } from "./TextInput";

export const AvatarControls: React.FC<{ roomRef: React.RefObject<any> }> = ({ roomRef }) => {
  const {
    isVoiceChatLoading,
    isVoiceChatActive,
    startVoiceChat,
    stopVoiceChat,
  } = useVoiceChat();
  const { interrupt } = useInterrupt();

  return (
    <div className="flex flex-col gap-3 relative w-full items-center">
      <ToggleGroup
        className={`glass rounded-xl p-1 border border-white/10 ${isVoiceChatLoading ? "opacity-50" : ""}`}
        disabled={isVoiceChatLoading}
        type="single"
        value={isVoiceChatActive || isVoiceChatLoading ? "voice" : "text"}
        onValueChange={(value) => {
          if (value === "voice" && !isVoiceChatActive && !isVoiceChatLoading) {
            startVoiceChat();
          } else if (
            value === "text" &&
            isVoiceChatActive &&
            !isVoiceChatLoading
          ) {
            stopVoiceChat();
          }
        }}
      >
        <ToggleGroupItem
          className="rounded-lg px-3 py-2 text-sm w-[110px] text-center data-[state=on]:bg-gradient-to-r data-[state=on]:from-[hsl(var(--primary))] data-[state=on]:to-[hsl(var(--primary-2))] data-[state=on]:text-white"
          value="voice"
        >
          Voice Chat
        </ToggleGroupItem>
        <ToggleGroupItem
          className="rounded-lg px-3 py-2 text-sm w-[110px] text-center data-[state=on]:bg-zinc-800"
          value="text"
        >
          Text Chat
        </ToggleGroupItem>
      </ToggleGroup>
      {isVoiceChatActive || isVoiceChatLoading ? <AudioInput /> : <TextInput roomRef={roomRef} />}
      <div className="absolute -top-16 right-3">
        <Button className="!bg-zinc-800 !text-white border border-white/10" onClick={interrupt}>
          Interrupt
        </Button>
      </div>
    </div>
  );
};
