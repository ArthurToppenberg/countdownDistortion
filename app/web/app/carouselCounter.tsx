"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Rotate3d, Timer, Gauge, PartyPopper } from "lucide-react";
import config from "./config.json";

const TARGET_DATE = new Date(config.countdown).getTime();
const SECONDS_PER_REVOLUTION = 30;
const MS_PER_REVOLUTION = SECONDS_PER_REVOLUTION * 1000;

interface CarouselStats {
  totalRevolutions: number;
  currentProgress: number;
}

function computeCarouselStats(now: number): CarouselStats {
  const diff = Math.max(0, TARGET_DATE - now);

  const totalRevolutions = Math.floor(diff / MS_PER_REVOLUTION);
  const currentProgress = (diff % MS_PER_REVOLUTION) / MS_PER_REVOLUTION;

  return { totalRevolutions, currentProgress };
}

const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 42;

function CarouselProgress({ progress }: { progress: number }) {
  const dashOffset = (1 - progress) * CIRCLE_CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs uppercase tracking-widest text-zinc-400">
        Nuværende omgang
      </p>
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
            stroke="url(#carouselGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={CIRCLE_CIRCUMFERENCE - dashOffset}
            className="transition-[stroke-dashoffset] duration-300 ease-linear"
          />
          <defs>
            <linearGradient
              id="carouselGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Rotate3d className="size-10 text-pink-400/80" />
        </div>
      </div>
      <p className="font-mono text-sm text-pink-400">
        {Math.round((1 - progress) * 100)}%
      </p>
    </div>
  );
}

function FunFact({ totalRevolutions }: { totalRevolutions: number }) {
  const totalHours = (
    (totalRevolutions * SECONDS_PER_REVOLUTION) /
    3600
  ).toFixed(0);
  const totalKm = ((totalRevolutions * 25) / 1000).toFixed(1);

  return (
    <div className="flex max-w-md flex-wrap justify-center gap-3">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm">
        <Timer className="size-3 text-pink-400" />
        {Number(totalHours).toLocaleString("da-DK")}t på karrusellen
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm">
        <Gauge className="size-3 text-orange-400" />
        {totalKm}km i cirkler
      </span>
    </div>
  );
}

export default function CarouselCounter() {
  const [stats, setStats] = useState<CarouselStats | null>(null);
  const rafRef = useRef<number>(0);

  const tick = useCallback((): void => {
    setStats(computeCarouselStats(Date.now()));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-pink-400" />
      </div>
    );
  }

  if (stats.totalRevolutions === 0 && stats.currentProgress === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <PartyPopper className="size-16 text-pink-400" />
        <h1 className="bg-gradient-to-r from-pink-300 via-rose-400 to-orange-500 bg-clip-text text-center font-mono text-5xl font-bold text-transparent sm:text-7xl">
          Hop på karrusellen!
        </h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-16">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <Rotate3d className="size-7 text-pink-400 sm:size-8" />
          <h2 className="bg-gradient-to-r from-pink-300 via-rose-400 to-orange-500 bg-clip-text text-center text-sm font-bold uppercase tracking-[0.3em] text-transparent sm:text-lg">
            Karrusel-omgange inden Distortion
          </h2>
          <Rotate3d className="size-7 text-pink-400 sm:size-8" />
        </div>
        <p className="text-xs text-zinc-500">
          {SECONDS_PER_REVOLUTION}s per omgang
        </p>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="bg-gradient-to-b from-white to-pink-200 bg-clip-text font-mono text-7xl font-black text-transparent sm:text-8xl md:text-9xl">
          {stats.totalRevolutions.toLocaleString()}
        </span>
        <span className="text-sm uppercase tracking-widest text-zinc-400">
          omgange tilbage
        </span>
      </div>

      <CarouselProgress progress={stats.currentProgress} />

      <FunFact totalRevolutions={stats.totalRevolutions} />
    </div>
  );
}
