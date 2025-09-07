import React, { forwardRef } from "react";
import { CloseIcon } from "../Icons";
import { Button } from "../Button";

interface AvatarVideoProps {
  isConnected?: boolean;
  onStop?: () => void;
}

export const AvatarVideo = forwardRef<HTMLVideoElement, AvatarVideoProps>(
  ({ isConnected = false, onStop }, ref) => {
    return (
      <>
        {isConnected && onStop && (
          <Button
            className="absolute top-3 right-3 !p-2 bg-zinc-900/70 border border-white/10 z-10"
            onClick={onStop}
          >
            <CloseIcon />
          </Button>
        )}
        <video
          id="anam-video"
          ref={ref}
          autoPlay
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        >
          <track kind="captions" />
        </video>
        {!isConnected && (
          <div className="w-full h-full flex items-center justify-center absolute inset-0">
            <div className="glass rounded-xl px-4 py-2 text-sm border border-white/10">Loading…</div>
          </div>
        )}
      </>
    );
  }
);
AvatarVideo.displayName = "AvatarVideo";
