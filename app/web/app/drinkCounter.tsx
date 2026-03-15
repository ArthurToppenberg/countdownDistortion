"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Beer, Zap, Flame, GlassWater, PartyPopper } from "lucide-react";
import config from "./config.json";

const TARGET_DATE = new Date(config.countdown).getTime();
const MINUTES_PER_DRINK = 10;

interface DrinkStats {
  totalDrinks: number;
  currentDrinkProgress: number;
}

function computeDrinkStats(now: number): DrinkStats {
  const diff = Math.max(0, TARGET_DATE - now);
  const totalMinutes = diff / (1000 * 60);

  const totalDrinks = Math.floor(totalMinutes / MINUTES_PER_DRINK);
  const currentDrinkProgress = (totalMinutes % MINUTES_PER_DRINK) / MINUTES_PER_DRINK;

  return { totalDrinks, currentDrinkProgress };
}

function DrinkProgress({ progress }: { progress: number }) {
  const fillHeight = (1 - progress) * 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs uppercase tracking-widest text-zinc-400">Nuværende drink</p>
      <div className="relative h-28 w-14 overflow-hidden rounded-xl border-2 border-amber-400/40 bg-white/5">
        <div
          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-amber-500 to-amber-300 transition-[height] duration-500 ease-linear"
          style={{ height: `${fillHeight}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <GlassWater className="size-6 text-white/70" />
        </div>
      </div>
      <p className="font-mono text-sm text-amber-400">{Math.round(fillHeight)}%</p>
    </div>
  );
}

function FunFact({ totalDrinks }: { totalDrinks: number }) {
  const liters = ((totalDrinks * 250) / 1000).toFixed(1);
  const caffeineMg = totalDrinks * 80;
  const caffeineKg = (caffeineMg / 1000).toFixed(1);

  return (
    <div className="flex max-w-md flex-wrap justify-center gap-3">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm">
        <Zap className="size-3 text-yellow-400" />
        {caffeineKg}kg koffein
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm">
        <GlassWater className="size-3 text-blue-400" />
        {liters}L Red Bull
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm">
        <Flame className="size-3 text-orange-400" />
        {(totalDrinks * 110).toLocaleString("da-DK")} kalorier
      </span>
    </div>
  );
}

export default function DrinkCounter() {
  const [stats, setStats] = useState<DrinkStats | null>(null);
  const rafRef = useRef<number>(0);

  const tick = useCallback((): void => {
    setStats(computeDrinkStats(Date.now()));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-amber-400" />
      </div>
    );
  }

  if (stats.totalDrinks === 0 && stats.currentDrinkProgress === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <PartyPopper className="size-16 text-amber-400" />
        <h1 className="bg-gradient-to-r from-amber-300 via-orange-400 to-red-500 bg-clip-text text-center font-mono text-5xl font-bold text-transparent sm:text-7xl">
          Tid til at drikke for alvor!
        </h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-16">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <Beer className="size-7 text-amber-400 sm:size-8" />
          <h2 className="bg-gradient-to-r from-amber-300 via-orange-400 to-red-500 bg-clip-text text-center text-sm font-bold uppercase tracking-[0.3em] text-transparent sm:text-lg">
            Red Bull Vodkaer inden Distortion
          </h2>
          <Beer className="size-7 text-amber-400 sm:size-8" />
        </div>
        <p className="text-xs text-zinc-500">1 hvert {MINUTES_PER_DRINK}. minut</p>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="bg-gradient-to-b from-white to-amber-200 bg-clip-text font-mono text-7xl font-black text-transparent sm:text-8xl md:text-9xl">
          {stats.totalDrinks.toLocaleString()}
        </span>
        <span className="text-sm uppercase tracking-widest text-zinc-400">drinks tilbage</span>
      </div>

      <DrinkProgress progress={stats.currentDrinkProgress} />

      <FunFact totalDrinks={stats.totalDrinks} />
    </div>
  );
}
