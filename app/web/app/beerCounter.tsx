"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Beer, Droplets, Weight, PartyPopper } from "lucide-react";
import config from "./config.json";

const TARGET_DATE = new Date(config.countdown).getTime();
const MINUTES_PER_BEER = 15;

interface BeerStats {
  totalBeers: number;
  currentBeerProgress: number;
}

function computeBeerStats(now: number): BeerStats {
  const diff = Math.max(0, TARGET_DATE - now);
  const totalMinutes = diff / (1000 * 60);

  const totalBeers = Math.floor(totalMinutes / MINUTES_PER_BEER);
  const currentBeerProgress =
    (totalMinutes % MINUTES_PER_BEER) / MINUTES_PER_BEER;

  return { totalBeers, currentBeerProgress };
}

function BeerProgress({ progress }: { progress: number }) {
  const fillHeight = (1 - progress) * 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs uppercase tracking-widest text-zinc-400">
        Nuværende øl
      </p>
      <div className="relative h-28 w-14 overflow-hidden rounded-xl border-2 border-yellow-400/40 bg-white/5">
        <div
          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-yellow-600 to-yellow-300 transition-[height] duration-500 ease-linear"
          style={{ height: `${fillHeight}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Beer className="size-6 text-white/70" />
        </div>
      </div>
      <p className="font-mono text-sm text-yellow-400">
        {Math.round(fillHeight)}%
      </p>
    </div>
  );
}

function FunFact({ totalBeers }: { totalBeers: number }) {
  const liters = ((totalBeers * 330) / 1000).toFixed(1);
  const crates = Math.floor(totalBeers / 24);

  return (
    <div className="flex max-w-md flex-wrap justify-center gap-3">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm">
        <Droplets className="size-3 text-yellow-400" />
        {liters}L øl
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm">
        <Weight className="size-3 text-yellow-400" />
        {crates.toLocaleString("da-DK")} kasser à 24
      </span>
    </div>
  );
}

export default function BeerCounter() {
  const [stats, setStats] = useState<BeerStats | null>(null);
  const rafRef = useRef<number>(0);

  const tick = useCallback((): void => {
    setStats(computeBeerStats(Date.now()));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-yellow-400" />
      </div>
    );
  }

  if (stats.totalBeers === 0 && stats.currentBeerProgress === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <PartyPopper className="size-16 text-yellow-400" />
        <h1 className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-center font-mono text-5xl font-bold text-transparent sm:text-7xl">
          Skål! Tid til Distortion!
        </h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-16">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <Beer className="size-7 text-yellow-400 sm:size-8" />
          <h2 className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-center text-sm font-bold uppercase tracking-[0.3em] text-transparent sm:text-lg">
            Øl du kan drikke inden Distortion
          </h2>
          <Beer className="size-7 text-yellow-400 sm:size-8" />
        </div>
        <p className="text-xs text-zinc-500">
          1 hvert {MINUTES_PER_BEER}. minut
        </p>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="bg-gradient-to-b from-white to-yellow-200 bg-clip-text font-mono text-7xl font-black text-transparent sm:text-8xl md:text-9xl">
          {stats.totalBeers.toLocaleString()}
        </span>
        <span className="text-sm uppercase tracking-widest text-zinc-400">
          øl tilbage
        </span>
      </div>

      <BeerProgress progress={stats.currentBeerProgress} />

      <FunFact totalBeers={stats.totalBeers} />
    </div>
  );
}
