import React, { useState } from 'react';
import { GameState } from '@/types/game';
import RoomCode from '@/components/ui/RoomCode';
import PlayerCard from '@/components/ui/PlayerCard';
import ColorPicker from '@/components/ui/ColorPicker';
import Button from '@/components/ui/Button';

interface LobbyScreenProps {
  gameState: GameState & {
    actions: any;
  };
}

export default function LobbyScreen({ gameState }: LobbyScreenProps) {
  const {
    roomCode,
    players,
    myId,
    settings,
    isHost,
    categories,
    customWordCount,
    error,
    actions,
  } = gameState;

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customWord, setCustomWord] = useState('');
  const [customMeaning, setCustomMeaning] = useState('');
  const [customHint, setCustomHint] = useState('');
  const [customHintError, setCustomHintError] = useState('');

  const me = players.find(p => p.id === myId);
  const myColor = me?.color || 'red';
  const occupiedColors = players.map(p => p.color);

  const maxImpostersAllowed = Math.max(1, Math.ceil(players.length / 5));
  const canStart = players.length >= 3 && settings.imposterCount <= maxImpostersAllowed;

  const activeCategoryLabel =
    settings.wordCategory === 'custom_only'
      ? 'Custom Words Only'
      : categories.find(c => c.id === settings.wordCategory)?.label || 'General';

  const handleAddCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomHintError('');

    const hintTrimmed = customHint.trim();
    if (!hintTrimmed || hintTrimmed.includes(' ')) {
      setCustomHintError('Hint must be strictly one word with no spaces');
      return;
    }

    if (customWord.trim() && hintTrimmed) {
      actions.addCustomWord(customWord.trim(), customMeaning.trim(), hintTrimmed);
      setCustomWord('');
      setCustomMeaning('');
      setCustomHint('');
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-4 py-6 max-w-md mx-auto space-y-6">
      {/* Top Bar / Room Code */}
      <RoomCode code={roomCode} />

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-card bg-danger/10 border border-danger text-danger text-sm text-center font-medium">
          {error}
        </div>
      )}

      {/* Players Section */}
      <div className="bg-surface border border-border rounded-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
            Players ({players.length} / {settings.maxPlayers})
          </h2>
          <span className="text-xs text-muted">
            Max Imposters allowed: <strong className="text-accent">{maxImpostersAllowed}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto pr-1">
          {players.map(p => (
            <PlayerCard
              key={p.id}
              player={p}
              isMe={p.id === myId}
              onTap={() => setShowColorPicker(true)}
            />
          ))}
        </div>
      </div>

      {/* Host Controls OR Read-Only Non-Host Display */}
      {isHost ? (
        <div className="bg-surface border border-border rounded-card p-4 space-y-4">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted border-b border-border pb-2">
            Host Settings
          </h3>

          {/* Imposter Count Stepper */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-primary block">Imposters</span>
              <span className="text-xs text-muted">Max {maxImpostersAllowed} for this group</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  actions.updateSettings({
                    imposterCount: Math.max(1, settings.imposterCount - 1),
                  })
                }
                disabled={settings.imposterCount <= 1}
                className="w-8 h-8 rounded-card bg-surface2 text-primary font-bold disabled:opacity-30 border border-border"
              >
                -
              </button>
              <span className="font-mono text-lg font-bold text-accent">
                {settings.imposterCount}
              </span>
              <button
                type="button"
                onClick={() =>
                  actions.updateSettings({
                    imposterCount: Math.min(maxImpostersAllowed, settings.imposterCount + 1),
                  })
                }
                disabled={settings.imposterCount >= maxImpostersAllowed}
                className="w-8 h-8 rounded-card bg-surface2 text-primary font-bold disabled:opacity-30 border border-border"
              >
                +
              </button>
            </div>
          </div>

          {/* Max Players Stepper */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div>
              <span className="text-sm font-semibold text-primary block">Max Players Limit</span>
              <span className="text-xs text-muted">Room capacity</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  actions.updateSettings({
                    maxPlayers: Math.max(players.length, settings.maxPlayers - 1),
                  })
                }
                disabled={settings.maxPlayers <= Math.max(3, players.length)}
                className="w-8 h-8 rounded-card bg-surface2 text-primary font-bold disabled:opacity-30 border border-border"
              >
                -
              </button>
              <span className="font-mono text-lg font-bold text-accent">
                {settings.maxPlayers}
              </span>
              <button
                type="button"
                onClick={() =>
                  actions.updateSettings({
                    maxPlayers: Math.min(20, settings.maxPlayers + 1),
                  })
                }
                disabled={settings.maxPlayers >= 20}
                className="w-8 h-8 rounded-card bg-surface2 text-primary font-bold disabled:opacity-30 border border-border"
              >
                +
              </button>
            </div>
          </div>

          {/* Category Select */}
          <div className="space-y-1 pt-2 border-t border-border/40">
            <label className="text-sm font-semibold text-primary block">Word Category</label>
            <select
              value={settings.wordCategory}
              onChange={e => actions.updateSettings({ wordCategory: e.target.value })}
              className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-card text-primary text-sm focus:outline-none focus:border-accent"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
              {customWordCount > 0 && (
                <option value="custom_only">Custom Words Only ({customWordCount})</option>
              )}
            </select>
          </div>

          {/* Voting Timer Input */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-primary block">Voting Timer (seconds)</label>
            <input
              type="number"
              min={0}
              max={300}
              value={settings.votingTimerSeconds}
              onChange={e =>
                actions.updateSettings({ votingTimerSeconds: parseInt(e.target.value) || 0 })
              }
              placeholder="0 = no timer"
              className="w-full px-3 py-2 bg-surface2 border border-border rounded-card text-primary text-sm font-mono focus:outline-none focus:border-accent"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-primary block">Hint Mode</span>
                <span className="text-xs text-muted">Imposter gets a 1-word clue</span>
              </div>
              <button
                type="button"
                onClick={() => actions.updateSettings({ hintMode: !settings.hintMode })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.hintMode ? 'bg-accent' : 'bg-surface2 border border-border'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    settings.hintMode ? 'left-6' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-primary block">Meaning Mode</span>
                <span className="text-xs text-muted">Crewmates get definition</span>
              </div>
              <button
                type="button"
                onClick={() => actions.updateSettings({ meaningMode: !settings.meaningMode })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.meaningMode ? 'bg-accent' : 'bg-surface2 border border-border'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    settings.meaningMode ? 'left-6' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Custom Words Form */}
          <div className="pt-2 border-t border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">Add Custom Words</span>
              <span className="text-xs text-accent font-mono">({customWordCount} added)</span>
            </div>
            <form onSubmit={handleAddCustomWord} className="space-y-2">
              <input
                type="text"
                value={customWord}
                onChange={e => setCustomWord(e.target.value)}
                placeholder="Word (e.g. Submarine)"
                required
                className="w-full px-3 py-1.5 bg-surface2 border border-border rounded-card text-xs text-primary focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                value={customMeaning}
                onChange={e => setCustomMeaning(e.target.value)}
                placeholder="Meaning (optional definition)"
                className="w-full px-3 py-1.5 bg-surface2 border border-border rounded-card text-xs text-primary focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                value={customHint}
                onChange={e => setCustomHint(e.target.value)}
                placeholder="Hint (strictly one word, no spaces)"
                required
                className="w-full px-3 py-1.5 bg-surface2 border border-border rounded-card text-xs text-primary focus:outline-none focus:border-accent"
              />
              {customHintError && (
                <p className="text-[11px] text-danger">{customHintError}</p>
              )}
              <button
                type="submit"
                className="w-full py-1.5 bg-surface2 border border-border hover:border-accent rounded-card text-xs font-bold text-accent"
              >
                + Add Custom Word
              </button>
            </form>
          </div>

          {/* Start Button */}
          <Button
            onClick={actions.startGame}
            variant="accent"
            fullWidth
            disabled={!canStart}
            className="mt-4"
          >
            {players.length < 3 ? 'Need at least 3 players' : 'START GAME'}
          </Button>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted">
              Game Settings (Read Only)
            </h3>
            <span className="text-xs text-accent font-mono animate-pulse">
              Controlled by Host 👑
            </span>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between p-2.5 rounded-card bg-surface2 border border-border">
              <span className="text-muted font-medium">Category</span>
              <span className="font-bold text-accent">{activeCategoryLabel}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-card bg-surface2 border border-border">
              <span className="text-muted font-medium">Imposters</span>
              <span className="font-mono font-bold text-primary">{settings.imposterCount}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-card bg-surface2 border border-border">
              <span className="text-muted font-medium">Voting Timer</span>
              <span className="font-mono font-bold text-primary">
                {settings.votingTimerSeconds > 0 ? `${settings.votingTimerSeconds}s` : 'No Timer'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-card bg-surface2 border border-border text-center">
                <span className="text-xs text-muted block">Hint Mode</span>
                <span className={`font-bold text-xs ${settings.hintMode ? 'text-success' : 'text-muted'}`}>
                  {settings.hintMode ? 'ENABLED 💡' : 'OFF'}
                </span>
              </div>
              <div className="p-2.5 rounded-card bg-surface2 border border-border text-center">
                <span className="text-xs text-muted block">Meaning Mode</span>
                <span className={`font-bold text-xs ${settings.meaningMode ? 'text-success' : 'text-muted'}`}>
                  {settings.meaningMode ? 'ENABLED 📖' : 'OFF'}
                </span>
              </div>
            </div>

            {customWordCount > 0 && (
              <div className="flex items-center justify-between p-2 rounded-card bg-surface2 border border-border text-xs">
                <span className="text-muted">Custom Words Added</span>
                <span className="font-mono font-bold text-accent">{customWordCount}</span>
              </div>
            )}
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-muted font-mono animate-pulse">
              Waiting for host to start the game...
            </p>
          </div>
        </div>
      )}

      {/* Leave Room Action */}
      <Button onClick={actions.leaveRoom} variant="ghost" fullWidth>
        Leave Room
      </Button>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <ColorPicker
          currentColor={myColor}
          occupiedColors={occupiedColors}
          onSelect={actions.changeColor}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </div>
  );
}
