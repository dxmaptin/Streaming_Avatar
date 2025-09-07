"use client";
import React from "react";
import { useLeaderboard } from "./GiftContext";

export const Leaderboard: React.FC = () => {
  const top = useLeaderboard();

  return (
    <div className="glass rounded-2xl border border-white/10 p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-zinc-200">Top Supporters</h2>
      </div>
      <div className="flex-1 overflow-auto space-y-2">
        {top.length === 0 ? (
          <p className="text-xs text-zinc-500">No donations yet</p>
        ) : (
          top.slice(0, 10).map((row, idx) => (
            <div
              key={row.name + idx}
              className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-400 w-5">#{idx + 1}</span>
                <span className="text-sm">{row.name}</span>
              </div>
              <span className="text-sm font-medium">${row.amount}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

