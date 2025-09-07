"use client";
import React, { useState } from "react";
import { GiftBar } from "./GiftBar";
import { Leaderboard } from "./Leaderboard";

export const GiftPanel: React.FC = () => {
  const [tab, setTab] = useState<"gifts" | "leaders">("gifts");

  return (
    <div className="glass rounded-2xl border border-white/10 p-3 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <button
          className={`text-xs px-3 py-1 rounded-full transition-colors ${
            tab === "gifts"
              ? "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-2))] text-white"
              : "bg-white/5 text-zinc-300 hover:bg-white/10"
          }`}
          onClick={() => setTab("gifts")}
        >
          Gifts
        </button>
        <button
          className={`text-xs px-3 py-1 rounded-full transition-colors ${
            tab === "leaders"
              ? "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-2))] text-white"
              : "bg-white/5 text-zinc-300 hover:bg-white/10"
          }`}
          onClick={() => setTab("leaders")}
        >
          Leaderboard
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            tab === "gifts" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          <GiftBar />
        </div>
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            tab === "leaders" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          <Leaderboard />
        </div>
      </div>
    </div>
  );
};
