"use client";
import React, { useState } from "react";
import { GiftType, GIFT_PRICES_CONST, useGifts } from "./GiftContext";
import { useTextChat } from "../logic/useTextChat";
import { useStreamingAvatarContext } from "../logic/context";

const gifts: { type: GiftType; label: string; icon: string }[] = [
  { type: "coffee", label: "Buy a Coffee", icon: "☕️" },
  { type: "lipstick", label: "Lipstick", icon: "💄" },
  { type: "bag", label: "Bag", icon: "👜" },
  { type: "designer", label: "Designer Clothes", icon: "👗" },
];

export const GiftBar: React.FC = () => {
  const { addDonation } = useGifts();
  const [name, setName] = useState("");
  const { repeatMessage } = useTextChat();

  return (
    <div className="glass rounded-xl border border-white/10 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <input
          className="glass border border-white/10 rounded-lg px-3 py-2 text-sm outline-none placeholder:text-zinc-400 flex-1"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="text-xs text-zinc-400 hidden md:block">Support the stream</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {gifts.map((g) => (
          <button
            key={g.type}
            aria-label={`${g.label} - $${GIFT_PRICES_CONST[g.type]}`}
            className={`group relative rounded-lg p-3 text-sm border border-white/10 text-white flex items-center justify-center transition-transform hover:scale-[1.03] ${
              g.type === "bag"
                ? "gift-button gift-button-bag"
                : g.type === "designer"
                ? "gift-button gift-button-designer"
                : "bg-gradient-to-r from-[hsl(var(--primary)/0.15)] to-[hsl(var(--primary-2)/0.15)]"
            }`}
            onClick={() => {
              const person = name.trim() || "Guest";
              addDonation(person, g.type);
              // Deterministic flirty thank-you without preamble
              const line =
                g.type === "coffee"
                  ? `Thanks for the coffee, ${person}! You're fueling my charm ☕️💜`
                  : g.type === "lipstick"
                  ? `Love the lipstick, ${person} — feeling extra glam! 💄✨`
                  : g.type === "bag"
                  ? `That bag is gorgeous, ${person} — you have great taste 👜💫`
                  : `Designer fit unlocked, ${person} — you're a total star 👗✨`;
              repeatMessage(line);
            }}
          >
            <span className="text-2xl select-none">{g.icon}</span>
            <span className="pointer-events-none absolute -top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-black/70 border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              ${GIFT_PRICES_CONST[g.type]}
            </span>
          </button>
        ))}
      </div>
      {/* Custom gifts removed as requested */}
    </div>
  );
};
