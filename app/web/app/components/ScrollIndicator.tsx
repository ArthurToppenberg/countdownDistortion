"use client";

import { useCallback, useEffect, useState } from "react";

export default function ScrollIndicator() {
  const [opacity, setOpacity] = useState(1);

  const handleScroll = useCallback((): void => {
    const fadeDistance = 200;
    const scrollY = window.scrollY;
    setOpacity(Math.max(0, 1 - scrollY / fadeDistance));
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (opacity <= 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-8 z-20 flex justify-center"
      style={{ opacity }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8 animate-bounce text-zinc-400"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
