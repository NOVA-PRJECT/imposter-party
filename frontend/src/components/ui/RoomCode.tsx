import React, { useState } from 'react';

interface RoomCodeProps {
  code: string;
}

export default function RoomCode({ code }: RoomCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={handleCopy}
      className="flex flex-col items-center justify-center p-4 bg-surface2 border border-border rounded-card cursor-pointer hover:border-accent/40 transition-colors select-none group"
    >
      <span className="text-xs uppercase tracking-widest text-muted font-mono mb-1">Room Code</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-3xl font-bold tracking-widest text-accent accent-glow">
          {code || '------'}
        </span>
        <span className="text-muted text-sm opacity-60 group-hover:opacity-100 transition-opacity">
          📋
        </span>
      </div>
      <span className="text-[11px] text-accent mt-1 h-3 font-medium">
        {copied ? 'Copied to clipboard!' : 'Tap to copy'}
      </span>
    </div>
  );
}
