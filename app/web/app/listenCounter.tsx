"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Music, Disc, Headphones, PartyPopper } from "lucide-react";
import config from "./config.json";

const TARGET_DATE = new Date(config.countdown).getTime();
const HOURS_PER_FULL_LISTEN = 10;
const MS_PER_FULL_LISTEN = HOURS_PER_FULL_LISTEN * 60 * 60 * 1000;

interface ListenStats {
  totalListens: number;
  currentListenProgress: number;
}

function computeListenStats(now: number): ListenStats {
  const diff = Math.max(0, TARGET_DATE - now);

  const totalListens = Math.floor(diff / MS_PER_FULL_LISTEN);
  const currentListenProgress = (diff % MS_PER_FULL_LISTEN) / MS_PER_FULL_LISTEN;

  return { totalListens, currentListenProgress };
}

const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 42;

function ListenProgress({ progress }: { progress: number }) {
  const dashOffset = (1 - progress) * CIRCLE_CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs uppercase tracking-widest text-zinc-400">Nuværende gennemlytning</p>
      <div className="relative size-24">
        <svg className="size-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="url(#listenGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={CIRCLE_CIRCUMFERENCE - dashOffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id="listenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Disc className="size-10 text-violet-400/80" />
        </div>
      </div>
      <p className="font-mono text-sm text-violet-400">{Math.round((1 - progress) * 100)}%</p>
    </div>
  );
}

function FunFact({ totalListens }: { totalListens: number }) {
  const totalHours = ((totalListens * HOURS_PER_FULL_LISTEN) / 1).toFixed(0);
  const totalDays = (totalListens * HOURS_PER_FULL_LISTEN / 24).toFixed(1);

  return (
    <div className="flex max-w-md flex-wrap justify-center gap-3">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm">
        <Headphones className="size-3 text-violet-400" />
        {totalHours}t Charlotte
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm">
        <Music className="size-3 text-fuchsia-400" />
        {totalDays} dage værd
      </span>
    </div>
  );
}

export default function ListenCounter() {
  const [stats, setStats] = useState<ListenStats | null>(null);
  const rafRef = useRef<number>(0);

  const tick = useCallback((): void => {
    setStats(computeListenStats(Date.now()));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-500" />
      </div>
    );
  }

  if (stats.totalListens === 0 && stats.currentListenProgress === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <PartyPopper className="size-16 text-violet-400" />
        <h1 className="bg-gradient-to-r from-violet-300 via-fuchsia-400 to-purple-500 bg-clip-text text-center font-mono text-5xl font-bold text-transparent sm:text-7xl">
          Ses til Distortion!
        </h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-16">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <Music className="size-7 text-violet-400 sm:size-8" />
          <h2 className="bg-gradient-to-r from-violet-300 via-fuchsia-400 to-purple-500 bg-clip-text text-center text-sm font-bold uppercase tracking-[0.3em] text-transparent sm:text-lg">
            Fulde gennemlytninger af Charlotte de Witte inden Distortion
          </h2>
          <Music className="size-7 text-violet-400 sm:size-8" />
        </div>
        <p className="text-xs text-zinc-500">{HOURS_PER_FULL_LISTEN}t per fuld diskografi</p>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="bg-gradient-to-b from-white to-violet-200 bg-clip-text font-mono text-7xl font-black text-transparent sm:text-8xl md:text-9xl">
          {stats.totalListens.toLocaleString()}
        </span>
        <span className="text-sm uppercase tracking-widest text-zinc-400">gennemlytninger tilbage</span>
      </div>

      <ListenProgress progress={stats.currentListenProgress} />

      <FunFact totalListens={stats.totalListens} />
    </div>
  );
}
