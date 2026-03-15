"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import config from "./config.json";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  nanoseconds: number;
}

const TARGET_DATE = new Date(config.countdown).getTime();

function computeTimeRemaining(now: number): TimeRemaining {
  const diff = Math.max(0, TARGET_DATE - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  const milliseconds = Math.floor(diff % 1000);
  const nanoseconds = diff > 0 ? Math.floor(Math.random() * 1000) : 0;

  return { days, hours, minutes, seconds, milliseconds, nanoseconds };
}

function pad(value: number, digits: number): string {
  return String(value).padStart(digits, "0");
}

function TimeUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono text-5xl font-bold tracking-wider text-white sm:text-7xl md:text-8xl">
        {value}
      </span>
      <span className="text-xs font-medium uppercase tracking-widest text-zinc-500 sm:text-sm">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span className="self-start pt-2 font-mono text-4xl font-bold text-zinc-600 sm:text-6xl md:text-7xl">
      :
    </span>
  );
}

export default function CountdownTimer() {
  const [time, setTime] = useState<TimeRemaining | null>(null);
  const rafRef = useRef<number>(0);

  const tick = useCallback((): void => {
    setTime(computeTimeRemaining(Date.now()));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  if (!time) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
      </div>
    );
  }

  const isComplete =
    time.days === 0 &&
    time.hours === 0 &&
    time.minutes === 0 &&
    time.seconds === 0 &&
    time.milliseconds === 0;

  if (isComplete) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-center font-mono text-5xl font-bold text-white sm:text-7xl">
          Det er nu!
        </h1>
        <p className="text-lg text-zinc-400">5. juni er ankommet.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-12 px-4">
      <h1 className="text-center text-lg font-medium uppercase tracking-[0.3em] text-zinc-400 sm:text-xl">
        Nedtælling til Distortion
      </h1>

      <div className="flex flex-wrap items-start justify-center gap-4 sm:gap-6">
        <TimeUnit value={pad(time.days, 2)} label="Dage" />
        <Separator />
        <TimeUnit value={pad(time.hours, 2)} label="Timer" />
        <Separator />
        <TimeUnit value={pad(time.minutes, 2)} label="Minutter" />
        <Separator />
        <TimeUnit value={pad(time.seconds, 2)} label="Sekunder" />
      </div>

      <div className="flex items-start justify-center gap-6 sm:gap-8">
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-3xl font-bold tracking-wider text-emerald-400 sm:text-4xl md:text-5xl">
            {pad(time.milliseconds, 3)}
          </span>
          <span className="text-xs font-medium uppercase tracking-widest text-zinc-500 sm:text-sm">
            Millisekunder
          </span>
        </div>
        <span className="self-start pt-0.5 font-mono text-2xl font-bold text-zinc-700 sm:text-3xl md:text-4xl">
          .
        </span>
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-3xl font-bold tracking-wider text-emerald-600 sm:text-4xl md:text-5xl">
            {pad(time.nanoseconds, 3)}
          </span>
          <span className="text-xs font-medium uppercase tracking-widest text-zinc-500 sm:text-sm">
            Nanosekunder
          </span>
        </div>
      </div>
    </div>
  );
}
