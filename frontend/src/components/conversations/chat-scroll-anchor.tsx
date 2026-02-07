"use client";

import React from "react";

type ChatScrollAnchorProps = {
  trackVisibility: boolean;
  isAtBottom: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
};

export default function ChatScrollAnchor({
  trackVisibility,
  isAtBottom,
  scrollAreaRef,
}: ChatScrollAnchorProps) {
  React.useEffect(() => {
    if (isAtBottom && trackVisibility) {
      if (!scrollAreaRef.current) return;

      const scrollAreaElement = scrollAreaRef.current;

      scrollAreaElement.scrollTop =
        scrollAreaElement.scrollHeight - scrollAreaElement.clientHeight;
    }
  }, [isAtBottom, trackVisibility]);

  return <div className="h-px w-full" />;
}
