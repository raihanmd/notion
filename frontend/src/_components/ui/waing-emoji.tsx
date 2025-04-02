"use client";
import { cn } from "~/lib/utils";

export function WavingEmoji({
  emoji = "👋",
  className,
}: {
  emoji?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "animate-waving repeat-infinite inline-block cursor-pointer transition-transform",
        className,
      )}
    >
      {emoji}
    </span>
  );
}
