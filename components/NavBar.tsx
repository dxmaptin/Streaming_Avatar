"use client";

export default function NavBar() {
  const status = { label: "Studio", color: "bg-zinc-700 text-zinc-300" };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full max-w-[1200px] px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md glow-ring" aria-hidden />
          <div className="bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-2))]">
            <p className="text-lg font-semibold">Studio Stream</p>
          </div>
        </div>
        <div className={`glass rounded-full px-3 py-1 text-xs ${status.color} border border-white/5`}>
          <span className="inline-flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${status.label === "Live" ? "bg-green-400 pulse" : status.label === "Connecting" ? "bg-yellow-300 animate-pulse" : "bg-zinc-400"}`} />
            {status.label}
          </span>
        </div>
      </div>
    </div>
  );
}
