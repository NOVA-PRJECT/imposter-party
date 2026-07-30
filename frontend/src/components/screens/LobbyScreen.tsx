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
    customWords = [],
    customWordCount,
    error,
    actions,
  } = gameState;

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [customWord, setCustomWord] = useState('');
  const [customMeaning, setCustomMeaning] = useState('');
  const [customHint, setCustomHint] = useState('');
  const [customHintError, setCustomHintError] = useState('');

  // Editing custom word state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editWord, setEditWord] = useState('');
  const [editMeaning, setEditMeaning] = useState('');
  const [editHint, setEditHint] = useState('');

  const me = players.find(p => p.id === myId);
  const myColor = me?.color || 'red';
  const onlinePlayers = players.filter(p => !p.disconnected);
  const maxImpostersAllowed = Math.max(1, Math.ceil(players.length / 5));
  const canStart = onlinePlayers.length >= 3 && settings.imposterCount <= maxImpostersAllowed;
  const occupiedColors = players.map(p => p.color);


  // Selected categories list
  const selectedCatIds = settings.selectedCategories || [];
  const allCategoryIds = categories.map(c => c.id);
  const isAllSelected = selectedCatIds.length === 0 || selectedCatIds.length >= allCategoryIds.length;

  const getCategorySummaryText = () => {
    if (selectedCatIds.includes('custom_only') && selectedCatIds.length === 1) {
      return `Custom Words Only (${customWords.length})`;
    }
    if (isAllSelected) {
      return `🔀 All Categories Ticked (${categories.length} Packs)`;
    }
    return `🎯 ${selectedCatIds.length} Categories Ticked`;
  };

  const handleToggleCategory = (catId: string) => {
    let nextSelected = isAllSelected ? [...allCategoryIds] : [...selectedCatIds];

    if (nextSelected.includes(catId)) {
      nextSelected = nextSelected.filter(id => id !== catId);
    } else {
      nextSelected.push(catId);
    }

    if (nextSelected.length === 0) {
      nextSelected = [...allCategoryIds];
    }

    actions.updateSettings({
      selectedCategories: nextSelected,
      wordCategory: nextSelected[0] || 'general',
    });
  };

  const handleSelectAllCategories = () => {
    actions.updateSettings({
      selectedCategories: [...allCategoryIds],
      wordCategory: 'general',
    });
  };

  const handleClearAllCategories = () => {
    actions.updateSettings({
      selectedCategories: [categories[0]?.id || 'general'],
      wordCategory: categories[0]?.id || 'general',
    });
  };

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

  const startEditCustomWord = (index: number) => {
    const item = customWords[index];
    if (item) {
      setEditingIndex(index);
      setEditWord(item.word);
      setEditMeaning(item.meaning || '');
      setEditHint(item.hint || '');
    }
  };

  const handleSaveEditCustomWord = (index: number) => {
    const hintTrimmed = editHint.trim();
    if (!hintTrimmed || hintTrimmed.includes(' ')) {
      setCustomHintError('Hint must be strictly one word with no spaces');
      return;
    }

    if (editWord.trim() && hintTrimmed) {
      actions.editCustomWord(index, editWord.trim(), editMeaning.trim(), hintTrimmed);
      setEditingIndex(null);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] px-4 py-6 max-w-md sm:max-w-xl md:max-w-2xl w-full mx-auto space-y-6">
      {/* Top Bar / Room Code */}
      <RoomCode code={roomCode} />

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-card bg-danger/10 border border-danger text-danger text-sm text-center font-medium">
          {error}
        </div>
      )}

      {/* Players Section */}
      <div className="bg-surface border border-border rounded-card p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted">
            Players ({players.length} / {settings.maxPlayers})
          </h2>
          <span className="text-xs text-muted">
            Max Imposters allowed: <strong className="text-accent">{maxImpostersAllowed}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 sm:max-h-80 overflow-y-auto pr-1">
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
        <div className="bg-surface border border-border rounded-card p-4 sm:p-6 space-y-5 shadow-xl">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted border-b border-border pb-2">
            Host Settings
          </h3>

          {/* Imposter Count Stepper */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm sm:text-base font-semibold text-primary block">Imposters</span>
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
                className="w-9 h-9 rounded-card bg-surface2 text-primary font-bold disabled:opacity-30 border border-border flex items-center justify-center text-lg active:scale-95 transition-transform"
              >
                -
              </button>
              <span className="font-mono text-xl font-bold text-accent">
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
                className="w-9 h-9 rounded-card bg-surface2 text-primary font-bold disabled:opacity-30 border border-border flex items-center justify-center text-lg active:scale-95 transition-transform"
              >
                +
              </button>
            </div>
          </div>

          {/* Max Players Stepper */}
          <div className="flex items-center justify-between pt-2.5 border-t border-border/40">
            <div>
              <span className="text-sm sm:text-base font-semibold text-primary block">Max Players Limit</span>
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
                className="w-9 h-9 rounded-card bg-surface2 text-primary font-bold disabled:opacity-30 border border-border flex items-center justify-center text-lg active:scale-95 transition-transform"
              >
                -
              </button>
              <span className="font-mono text-xl font-bold text-accent">
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
                className="w-9 h-9 rounded-card bg-surface2 text-primary font-bold disabled:opacity-30 border border-border flex items-center justify-center text-lg active:scale-95 transition-transform"
              >
                +
              </button>
            </div>
          </div>

          {/* Category Ticking Checklist Button */}
          <div className="space-y-1.5 pt-2.5 border-t border-border/40">
            <div className="flex items-center justify-between">
              <label className="text-sm sm:text-base font-semibold text-primary block">Word Categories</label>
              <span className="text-xs text-accent font-mono font-bold">
                {getCategorySummaryText()}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="w-full p-3.5 bg-surface2 hover:bg-border border border-border rounded-card text-left text-sm font-semibold text-primary flex items-center justify-between transition-colors shadow-sm"
            >
              <span>{getCategorySummaryText()}</span>
              <span className="text-xs text-accent underline">Tick Categories ✏️</span>
            </button>
          </div>

          {/* Voting Timer Dropdown */}
          <div className="space-y-1 pt-2.5 border-t border-border/40">
            <label className="text-sm sm:text-base font-semibold text-primary block">Voting Timer</label>
            <select
              value={settings.votingTimerSeconds}
              onChange={e =>
                actions.updateSettings({ votingTimerSeconds: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3.5 py-3 bg-surface2 border border-border rounded-card text-primary text-sm sm:text-base font-mono focus:outline-none focus:border-accent cursor-pointer"
            >
              {Array.from({ length: 26 }, (_, i) => i + 5).map(sec => (
                <option key={sec} value={sec}>
                  {sec} Seconds{sec === 10 ? ' (Default)' : ''}
                </option>
              ))}
              <option value={0}>No Timer (Manual)</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2.5 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm sm:text-base font-semibold text-primary block">Hint Mode</span>
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
                <span className="text-sm sm:text-base font-semibold text-primary block">Meaning Mode</span>
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

          {/* CUSTOM WORDS MANAGEMENT SECTION */}
          <div className="pt-3 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-semibold text-primary">Custom Words Pack</span>
              <span className="text-xs text-accent font-mono font-bold">
                ({customWords.length} Added)
              </span>
            </div>

            {/* List of Added Custom Words with Edit & Delete */}
            {customWords.length > 0 && (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {customWords.map((cw, idx) => (
                  <div
                    key={cw.id || idx}
                    className="p-3 rounded-card bg-surface2 border border-border flex flex-col space-y-2"
                  >
                    {editingIndex === idx ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editWord}
                          onChange={e => setEditWord(e.target.value)}
                          placeholder="Word"
                          className="w-full px-3 py-1.5 bg-surface border border-border rounded text-xs text-primary"
                        />
                        <input
                          type="text"
                          value={editMeaning}
                          onChange={e => setEditMeaning(e.target.value)}
                          placeholder="Meaning"
                          className="w-full px-3 py-1.5 bg-surface border border-border rounded text-xs text-primary"
                        />
                        <input
                          type="text"
                          value={editHint}
                          onChange={e => setEditHint(e.target.value)}
                          placeholder="Hint (one word)"
                          className="w-full px-3 py-1.5 bg-surface border border-border rounded text-xs text-primary"
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingIndex(null)}
                            className="px-3 py-1 text-xs text-muted font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditCustomWord(idx)}
                            className="px-3.5 py-1 bg-accent text-white text-xs font-bold rounded"
                          >
                            Save ✓
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm sm:text-base text-primary truncate">
                              {cw.word}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-warning bg-warning/10 px-2 py-0.5 rounded border border-warning/20">
                              Hint: "{cw.hint}"
                            </span>
                          </div>
                          {cw.meaning && (
                            <p className="text-xs text-muted truncate mt-0.5">
                              {cw.meaning}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => startEditCustomWord(idx)}
                            className="p-1.5 rounded bg-surface text-accent hover:text-white text-xs font-bold border border-border active:scale-95"
                            title="Edit Custom Word"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => actions.deleteCustomWord(idx)}
                            className="p-1.5 rounded bg-danger/10 text-danger hover:bg-danger hover:text-white text-xs font-bold border border-danger/30 active:scale-95"
                            title="Delete Custom Word"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Custom Word Form */}
            <form onSubmit={handleAddCustomWord} className="space-y-2.5 pt-1">
              <input
                type="text"
                value={customWord}
                onChange={e => setCustomWord(e.target.value)}
                placeholder="Word (e.g. Submarine)"
                required
                className="w-full px-3.5 py-2 bg-surface2 border border-border rounded-card text-xs sm:text-sm text-primary focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                value={customMeaning}
                onChange={e => setCustomMeaning(e.target.value)}
                placeholder="Meaning (optional definition)"
                className="w-full px-3.5 py-2 bg-surface2 border border-border rounded-card text-xs sm:text-sm text-primary focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                value={customHint}
                onChange={e => setCustomHint(e.target.value)}
                placeholder="Hint (strictly one word, no spaces)"
                required
                className="w-full px-3.5 py-2 bg-surface2 border border-border rounded-card text-xs sm:text-sm text-primary focus:outline-none focus:border-accent"
              />
              {customHintError && (
                <p className="text-[11px] text-danger">{customHintError}</p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 bg-surface2 border border-border hover:border-accent rounded-card text-xs sm:text-sm font-bold text-accent shadow-sm active:scale-95 transition-transform"
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
            {onlinePlayers.length < 3 ? 'Need at least 3 players' : 'START GAME'}
          </Button>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-card p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted">
              Game Settings (Read Only)
            </h3>
            <span className="text-xs text-accent font-mono animate-pulse font-bold">
              Controlled by Host 👑
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-card bg-surface2 border border-border">
              <span className="text-muted text-xs block font-medium">Ticked Categories</span>
              <span className="font-bold text-accent text-sm sm:text-base block mt-0.5">
                {getCategorySummaryText()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-card bg-surface2 border border-border">
              <span className="text-muted font-medium">Imposters</span>
              <span className="font-mono font-bold text-primary text-base">{settings.imposterCount}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-card bg-surface2 border border-border">
              <span className="text-muted font-medium">Voting Timer</span>
              <span className="font-mono font-bold text-primary text-base">
                {settings.votingTimerSeconds > 0 ? `${settings.votingTimerSeconds}s` : 'No Timer'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-card bg-surface2 border border-border text-center">
                <span className="text-xs text-muted block">Hint Mode</span>
                <span className={`font-bold text-xs ${settings.hintMode ? 'text-success' : 'text-muted'}`}>
                  {settings.hintMode ? 'ENABLED 💡' : 'OFF'}
                </span>
              </div>
              <div className="p-3 rounded-card bg-surface2 border border-border text-center">
                <span className="text-xs text-muted block">Meaning Mode</span>
                <span className={`font-bold text-xs ${settings.meaningMode ? 'text-success' : 'text-muted'}`}>
                  {settings.meaningMode ? 'ENABLED 📖' : 'OFF'}
                </span>
              </div>
            </div>

            {customWords.length > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-card bg-surface2 border border-border text-xs sm:text-sm">
                <span className="text-muted">Custom Words Added</span>
                <span className="font-mono font-bold text-accent">{customWords.length}</span>
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

      {/* CATEGORY CHECKBOX TICKING MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 max-w-lg w-[92vw] space-y-4 shadow-2xl relative animate-fadeIn max-h-[85vh] flex flex-col justify-between">
            <button
              onClick={() => setShowCategoryModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white font-bold text-xl p-1"
            >
              ✕
            </button>

            <div className="text-center border-b border-border pb-3">
              <h2 className="text-2xl font-extrabold text-primary">Tick Word Categories</h2>
              <p className="text-xs text-muted">
                Words will cycle through your ticked categories with anti-adjacency!
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleSelectAllCategories}
                className="py-2.5 rounded-card bg-surface2 hover:bg-border text-xs sm:text-sm font-bold text-accent border border-border active:scale-95"
              >
                ✓ Select All ({categories.length})
              </button>
              <button
                type="button"
                onClick={handleClearAllCategories}
                className="py-2.5 rounded-card bg-surface2 hover:bg-border text-xs sm:text-sm font-bold text-muted border border-border active:scale-95"
              >
                ✕ Clear All
              </button>
            </div>

            {/* Checkboxes List */}
            <div className="space-y-2.5 overflow-y-auto pr-1 my-2 max-h-[48vh]">
              {categories.map(cat => {
                const isChecked = isAllSelected || selectedCatIds.includes(cat.id);

                return (
                  <label
                    key={cat.id}
                    className={`flex items-center justify-between p-3.5 rounded-card border cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-accent/10 border-accent text-primary'
                        : 'bg-surface2/50 border-border text-muted hover:text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleCategory(cat.id)}
                        className="w-4 h-4 accent-accent rounded cursor-pointer"
                      />
                      <span className="font-semibold text-sm sm:text-base">{cat.label}</span>
                    </div>
                    {isChecked && (
                      <span className="text-accent font-mono text-xs font-bold">✓ Ticked</span>
                    )}
                  </label>
                );
              })}

              {/* Custom Words Option */}
              {customWords.length > 0 && (
                <label
                  className={`flex items-center justify-between p-3.5 rounded-card border cursor-pointer transition-colors ${
                    selectedCatIds.includes('custom_only')
                      ? 'bg-accent/10 border-accent text-primary'
                      : 'bg-surface2/50 border-border text-muted hover:text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedCatIds.includes('custom_only')}
                      onChange={() => handleToggleCategory('custom_only')}
                      className="w-4 h-4 accent-accent rounded cursor-pointer"
                    />
                    <span className="font-semibold text-sm sm:text-base">Custom Words Only ({customWords.length})</span>
                  </div>
                  {selectedCatIds.includes('custom_only') && (
                    <span className="text-accent font-mono text-xs font-bold">✓ Ticked</span>
                  )}
                </label>
              )}
            </div>

            <Button onClick={() => setShowCategoryModal(false)} variant="accent" fullWidth>
              Done Ticking Categories ✓
            </Button>
          </div>
        </div>
      )}

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
