"use client";
import { Suspense } from "react";
import { InteractiveAvatar } from "@/components/InteractiveAvatar";
import { MessageHistory } from "@/components/AvatarSession/MessageHistory";
import { StreamingAvatarProvider } from "@/components/logic";
import { GiftProvider } from "@/components/gifting/GiftContext";
import { GiftPanel } from "@/components/gifting/GiftPanel";

export default function App() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <GiftProvider>
        <div className="w-screen h-[calc(100vh-88px)] flex items-start justify-center px-6 pb-20">
          <div className="w-full max-w-[1500px] flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-[4fr_1.2fr] gap-6">
              <div className="min-w-0 flex flex-col gap-3">
                <Suspense fallback={null}>
                  <InteractiveAvatar />
                </Suspense>
              </div>
              <aside className="min-w-0 md:h-full flex flex-col gap-3">
                <div className="glass rounded-2xl border border-white/10 p-4 h-[60%] md:h-[70%] flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium text-zinc-200">Chat</h2>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <MessageHistory />
                  </div>
                </div>
                <GiftPanel />
              </aside>
            </div>
          </div>
        </div>
      </GiftProvider>
    </StreamingAvatarProvider>
  );
}
