"use client";
import React, { useEffect } from "react";
import { useGifts } from "./GiftContext";

const GiftVisual = ({ gift }: { gift: string }) => {
  if (gift === "coffee") return <span className="text-3xl">☕️</span>;
  if (gift === "lipstick") return <span className="text-3xl">💄</span>;
  if (gift === "bag")
    return (
      <div className="gift-bag-visual">
        <span className="text-3xl">👜</span>
        <span className="trail" />
      </div>
    );
  if (gift === "designer")
    return (
      <div className="gift-designer-visual">
        <span className="sparkle">✨</span>
        <span className="text-3xl">👗</span>
        <span className="sparkle delay-200">✨</span>
      </div>
    );
  return null;
};

export const GiftOverlay: React.FC = () => {
  const { queue, popAnimation } = useGifts();

  useEffect(() => {
    const timeouts = queue.map((a) =>
      setTimeout(() => popAnimation(a.id), 3200),
    );
    return () => timeouts.forEach(clearTimeout);
  }, [queue, popAnimation]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {queue.map((a, i) => {
        const top = 14 + (i % 5) * 16; // spread lanes
        const cls =
          a.gift === "bag"
            ? "gift-fly-bag"
            : a.gift === "designer"
              ? "gift-fly-designer"
              : "gift-fly";
        return (
          <div key={a.id} className={`absolute ${cls}`} style={{ top: `${top}%` }}>
            <div className="flex items-center gap-3 bg-black/30 border border-white/20 rounded-full px-4 py-2 shadow-lg">
              <GiftVisual gift={a.gift} />
              <span className="text-sm">Thanks!</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
