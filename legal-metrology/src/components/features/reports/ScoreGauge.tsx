'use client';

import { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#16a34a';
  if (score >= 60) return '#eab308';
  return '#dc2626';
}

export function ScoreGauge({ score, size = 160 }: ScoreGaugeProps) {
  const [mounted, setMounted] = useState(false);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getScoreColor(score);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const dashOffset = mounted ? circumference - (score / 100) * circumference : circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={8}
          className="text-muted/50"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
