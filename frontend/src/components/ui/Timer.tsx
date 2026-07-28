import React from 'react';

interface TimerProps {
  seconds: number | null;
}

export default function Timer({ seconds }: TimerProps) {
  if (seconds === null || seconds === undefined) return null;

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${mins > 0 ? `${mins}:` : ''}${secs < 10 ? '0' : ''}${secs}`;

  const isWarning = seconds <= 10;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-mono font-bold text-lg shadow-md transition-colors ${
        isWarning
          ? 'bg-danger/20 border-danger text-danger animate-pulse'
          : 'bg-surface2 border-border text-primary'
      }`}
    >
      <span>⏱️</span>
      <span>{formatted}</span>
    </div>
  );
}
