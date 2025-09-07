"use client";
import React, { createContext, useContext, useMemo, useState } from "react";

export type GiftType = "coffee" | "lipstick" | "bag" | "designer";

export type Donation = {
  id: string;
  name: string;
  gift: GiftType;
  amount: number;
  at: number;
};

type GiftAnimation = { id: string; gift: GiftType };

type GiftContextType = {
  donations: Donation[];
  addDonation: (name: string, gift: GiftType) => void;
  queue: GiftAnimation[];
  popAnimation: (id: string) => void;
};

const GIFT_PRICES: Record<GiftType, number> = {
  coffee: 5,
  lipstick: 10,
  bag: 50,
  designer: 200,
};

const GiftContext = createContext<GiftContextType | null>(null);

export const GiftProvider = ({ children }: { children: React.ReactNode }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [queue, setQueue] = useState<GiftAnimation[]>([]);

  const addDonation = (name: string, gift: GiftType) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setDonations((d) => [
      ...d,
      { id, name: name || "Guest", gift, amount: GIFT_PRICES[gift], at: Date.now() },
    ]);
    setQueue((q) => [...q, { id, gift }]);
  };

  const popAnimation = (id: string) => {
    setQueue((q) => q.filter((a) => a.id !== id));
  };

  const value = useMemo(
    () => ({ donations, addDonation, queue, popAnimation }),
    [donations, queue],
  );

  return <GiftContext.Provider value={value}>{children}</GiftContext.Provider>;
};

export const useGifts = () => {
  const ctx = useContext(GiftContext);
  if (!ctx) throw new Error("useGifts must be used within GiftProvider");
  return ctx;
};

export const useLeaderboard = () => {
  const { donations } = useGifts();
  const totals = new Map<string, number>();
  for (const d of donations) totals.set(d.name, (totals.get(d.name) || 0) + d.amount);
  return Array.from(totals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
};

export const GIFT_PRICES_CONST = GIFT_PRICES;
