import React, { useState, useEffect } from 'react';
import { useGame } from '@/hooks/useGame';
import HomeScreen from '@/components/screens/HomeScreen';
import PhaseGate from '@/components/ui/PhaseGate';
import { toggleMute, getIsMuted } from '@/lib/audioManager';
import { THEMES, getSavedTheme, applyTheme } from '@/lib/themeManager';

export default function App() {
  const gameState = useGame();
  const [muted, setMuted] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState('dark');
  const [showThemeModal, setShowThemeModal] = useState(false);

  useEffect(() => {
    setMuted(getIsMuted());
    const saved = getSavedTheme();
    setCurrentThemeId(saved);
    applyTheme(saved);
  }, []);

  const handleToggleSound = () => {
    const nextMuted = toggleMute();
    setMuted(nextMuted);
  };

  const handleSelectTheme = (themeId: string) => {
    setCurrentThemeId(themeId);
    applyTheme(themeId);
    setShowThemeModal(false);
  };

  return (
    <main className="min-h-screen bg-background text-primary relative transition-colors duration-300">
      {/* Top Floating Control Bar */}
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
        {/* Theme Switcher Button */}
        <button
          type="button"
          onClick={() => setShowThemeModal(true)}
          className="w-10 h-10 rounded-full bg-surface2/80 backdrop-blur border border-border text-primary flex items-center justify-center text-lg hover:border-accent active:scale-95 transition-all shadow-lg select-none"
          title="Change Theme"
        >
          🎨
        </button>

        {/* Sound Mute Toggle Button */}
        <button
          type="button"
          onClick={handleToggleSound}
          className="w-10 h-10 rounded-full bg-surface2/80 backdrop-blur border border-border text-primary flex items-center justify-center text-lg hover:border-accent active:scale-95 transition-all shadow-lg select-none"
          title={muted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      {!gameState.roomCode ? (
        <HomeScreen gameState={gameState} />
      ) : (
        <PhaseGate gameState={gameState} />
      )}

      {/* MULTI-THEME SELECTOR MODAL */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-[92vw] space-y-4 shadow-2xl relative animate-fadeIn max-h-[85vh] flex flex-col justify-between">
            <button
              onClick={() => setShowThemeModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white font-bold text-xl p-1"
            >
              ✕
            </button>

            <div className="text-center border-b border-border pb-3">
              <h2 className="text-2xl font-extrabold text-primary">Choose Your Theme</h2>
              <p className="text-xs text-muted">Personalize your game aesthetic!</p>
            </div>

            {/* Theme Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 my-2 max-h-[50vh]">
              {THEMES.map(theme => {
                const isSelected = currentThemeId === theme.id;

                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`p-3.5 rounded-card border text-left flex flex-col justify-between transition-all select-none active:scale-95 ${
                      isSelected
                        ? 'bg-accent/15 border-accent ring-2 ring-accent/40 shadow-lg'
                        : 'bg-surface2/70 border-border hover:border-accent/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-primary flex items-center gap-1.5">
                          <span>{theme.emoji}</span>
                          <span>{theme.name}</span>
                        </span>
                        {isSelected && (
                          <span className="text-accent font-mono text-xs font-bold">✓ Active</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted line-clamp-2">{theme.description}</p>
                    </div>

                    {/* Color Swatch Preview */}
                    <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-border/40">
                      <div
                        className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                        style={{ backgroundColor: theme.previewColors.bg }}
                        title="Background"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                        style={{ backgroundColor: theme.previewColors.surface }}
                        title="Surface"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                        style={{ backgroundColor: theme.previewColors.accent }}
                        title="Accent"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                        style={{ backgroundColor: theme.previewColors.text }}
                        title="Text"
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowThemeModal(false)}
              className="w-full py-3 bg-surface2 hover:bg-border text-primary font-bold text-sm rounded-card border border-border"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
