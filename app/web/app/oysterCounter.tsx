"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Shell, Waves, Weight, PartyPopper } from "lucide-react";
import config from "./config.json";

const TARGET_DATE = new Date(config.countdown).getTime();
const MINUTES_PER_OYSTER = 30;

interface OysterStats {
  totalOysters: number;
  currentOysterProgress: number;
}

function computeOysterStats(now: number): OysterStats {
  const diff = Math.max(0, TARGET_DATE - now);
  const totalMinutes = diff / (1000 * 60);

  const totalOysters = Math.floor(totalMinutes / MINUTES_PER_OYSTER);
  const currentOysterProgress =
    (totalMinutes % MINUTES_PER_OYSTER) / MINUTES_PER_OYSTER;

  return { totalOysters, currentOysterProgress };
}

function OysterProgress({ progress }: { progress: number }) {
  const fillHeight = (1 - progress) * 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs uppercase tracking-widest text-zinc-400">
        Nuværende østers
      </p>
      <div className="relative h-28 w-14 overflow-hidden rounded-xl border-2 border-teal-400/40 bg-white/5">
        <div
          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-teal-500 to-teal-300 transition-[height] duration-500 ease-linear"
          style={{ height: `${fillHeight}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shell className="size-6 text-white/70" />
        </div>
      </div>
      <p className="font-mono text-sm text-teal-400">
        {Math.round(fillHeight)}%
      </p>
    </div>
  );
}

function FunFact({ totalOysters }: { totalOysters: number }) {
  const weightKg = ((totalOysters * 60) / 1000).toFixed(1);
  const trays = Math.floor(totalOysters / 12);

  return (
    <div className="flex max-w-md flex-wrap justify-center gap-3">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm">
        <Weight className="size-3 text-teal-400" />
        {weightKg}kg østers
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm">
        <Waves className="size-3 text-cyan-400" />
        {trays.toLocaleString("da-DK")} fade à 12
      </span>
    </div>
  );
}

export default function OysterCounter() {
  const [stats, setStats] = useState<OysterStats | null>(null);
  const rafRef = useRef<number>(0);

  const tick = useCallback((): void => {
    setStats(computeOysterStats(Date.now()));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-teal-400" />
      </div>
    );
  }

  if (stats.totalOysters === 0 && stats.currentOysterProgress === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <PartyPopper className="size-16 text-teal-400" />
        <h1 className="bg-gradient-to-r from-teal-300 via-cyan-400 to-blue-500 bg-clip-text text-center font-mono text-5xl font-bold text-transparent sm:text-7xl">
          Slurp! Tid til Distortion!
        </h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-16">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <Shell className="size-7 text-teal-400 sm:size-8" />
          <h2 className="bg-gradient-to-r from-teal-300 via-cyan-400 to-blue-500 bg-clip-text text-center text-sm font-bold uppercase tracking-[0.3em] text-transparent sm:text-lg">
            Østers du kan spise inden Distortion
          </h2>
          <Shell className="size-7 text-teal-400 sm:size-8" />
        </div>
        <p className="text-xs text-zinc-500">
          1 hvert {MINUTES_PER_OYSTER}. minut
        </p>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="bg-gradient-to-b from-white to-teal-200 bg-clip-text font-mono text-7xl font-black text-transparent sm:text-8xl md:text-9xl">
          {stats.totalOysters.toLocaleString()}
        </span>
        <span className="text-sm uppercase tracking-widest text-zinc-400">
          østers tilbage
        </span>
      </div>

      <OysterProgress progress={stats.currentOysterProgress} />

      <FunFact totalOysters={stats.totalOysters} />
    </div>
  );
}
