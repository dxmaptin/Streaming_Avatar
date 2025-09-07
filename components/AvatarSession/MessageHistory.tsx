import React, { useEffect, useRef } from "react";

import { useMessageHistory, MessageSender } from "../logic";

export const MessageHistory: React.FC = () => {
  const { messages } = useMessageHistory();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || messages.length === 0) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto flex flex-col gap-3 px-1 py-1 text-white"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex flex-col gap-1 max-w-[85%] ${
            message.sender === MessageSender.CLIENT
              ? "self-end items-end"
              : "self-start items-start"
          }`}
        >
          <p className="text-[10px] uppercase tracking-wide text-zinc-400">
            {message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
          </p>
          <div className={`rounded-xl px-3 py-2 text-sm border ${
            message.sender === MessageSender.CLIENT
              ? "bg-gradient-to-r from-[hsl(var(--primary)/0.2)] to-[hsl(var(--primary-2)/0.2)] border-white/10"
              : "glass border-white/10"
          }`}>
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
};
