import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Sparkles, Trophy, Info, X, Zap, Coins, Flame } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, duration: 4000, ...toast };

    setToasts((prev) => [newToast, ...prev.slice(0, 2)]); // Keep at most 3 toasts active

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, [removeToast]);

  const toast = {
    success: (title, subtitle) => addToast({ type: 'success', title, subtitle }),
    error: (title, subtitle) => addToast({ type: 'error', title, subtitle }),
    info: (title, subtitle) => addToast({ type: 'info', title, subtitle }),
    reward: (data) => addToast({ type: 'reward', ...data, duration: 4500 }),
    achievement: (data) => addToast({ type: 'achievement', ...data, duration: 5000 }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Notification Container (Fixed Top Center) */}
      <div
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2.5 pointer-events-none max-w-md w-full px-4"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              role="alert"
              aria-atomic="true"
              initial={{ opacity: 0, y: -25, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.92 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="pointer-events-auto w-full bg-slate-900/95 border border-slate-800 backdrop-blur-md rounded-2xl shadow-2xl p-4 flex items-start gap-3.5 text-slate-100 overflow-hidden relative"
            >
              {/* Type-based Icon & Accent */}
              {t.type === 'success' && (
                <>
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0 border border-emerald-500/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">{t.title}</div>
                    {t.subtitle && <div className="text-xs text-slate-400 mt-0.5">{t.subtitle}</div>}
                  </div>
                </>
              )}

              {t.type === 'error' && (
                <>
                  <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl shrink-0 border border-rose-500/30">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-rose-200">{t.title}</div>
                    {t.subtitle && <div className="text-xs text-rose-300/80 mt-0.5">{t.subtitle}</div>}
                  </div>
                </>
              )}

              {t.type === 'info' && (
                <>
                  <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl shrink-0 border border-sky-500/30">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">{t.title}</div>
                    {t.subtitle && <div className="text-xs text-slate-400 mt-0.5">{t.subtitle}</div>}
                  </div>
                </>
              )}

              {t.type === 'reward' && (
                <>
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 border border-amber-500/40">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-[11px] uppercase tracking-wider font-extrabold text-amber-400">
                      QUEST COMPLETE
                    </div>
                    <div className="text-sm font-bold text-white truncate">{t.title}</div>
                    <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs font-bold">
                      {t.xp != null && (
                        <span className="flex items-center gap-1 text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-500/30">
                          <Zap className="w-3 h-3 text-purple-400" /> +{t.xp} XP
                        </span>
                      )}
                      {t.gold != null && (
                        <span className="flex items-center gap-1 text-yellow-300 bg-yellow-950/60 px-2 py-0.5 rounded-md border border-yellow-500/30">
                          <Coins className="w-3 h-3 text-yellow-400" /> +{t.gold} G
                        </span>
                      )}
                      {t.attribute && (
                        <span className="text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-500/30 uppercase text-[10px]">
                          +{t.attributeIncrease || 5} {t.attribute}
                        </span>
                      )}
                      {t.streakIncreased && (
                        <span className="flex items-center gap-1 text-orange-300 bg-orange-950/60 px-2 py-0.5 rounded-md border border-orange-500/30 text-[10px]">
                          <Flame className="w-3 h-3 text-orange-400" /> +1 Streak
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}

              {t.type === 'achievement' && (
                <>
                  <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 rounded-xl shrink-0 shadow-lg shadow-amber-500/20">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="text-[10px] uppercase font-mono font-extrabold text-amber-400 tracking-wider">
                      TROPHY UNLOCKED
                    </div>
                    <div className="text-sm font-black text-white truncate">{t.name}</div>
                    <div className="text-xs text-slate-400 truncate">{t.description}</div>
                  </div>
                </>
              )}

              {/* Close Dismiss Button */}
              <button
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss notification"
                className="p-1 text-slate-500 hover:text-slate-300 rounded-lg transition shrink-0 focus-visible:ring-1 focus-visible:ring-amber-400"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
