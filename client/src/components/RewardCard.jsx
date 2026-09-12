import React from 'react';
import { Sparkles, Palette, Trophy, Shield, Coins, Check, Loader2 } from 'lucide-react';

const ICON_MAP = {
  Sparkles: Sparkles,
  Palette: Palette,
  Trophy: Trophy,
  Shield: Shield,
};

const RARITY_STYLES = {
  COMMON: {
    border: 'border-slate-700',
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    glow: 'from-slate-800/10 to-slate-900/10',
    accent: 'text-slate-300',
  },
  RARE: {
    border: 'border-sky-500/40',
    badge: 'bg-sky-950/60 text-sky-400 border-sky-500/40',
    glow: 'from-sky-600/10 to-indigo-600/10',
    accent: 'text-sky-400',
  },
  EPIC: {
    border: 'border-purple-500/50',
    badge: 'bg-purple-950/60 text-purple-300 border-purple-500/40',
    glow: 'from-purple-600/15 to-indigo-600/10',
    accent: 'text-purple-400',
  },
  LEGENDARY: {
    border: 'border-amber-500/60',
    badge: 'bg-amber-950/60 text-amber-300 border-amber-500/50',
    glow: 'from-amber-500/15 to-orange-600/15',
    accent: 'text-amber-400',
  },
};

export default function RewardCard({
  item,
  isOwned = false,
  userGold = 0,
  onPurchase,
  isPurchasing = false,
}) {
  const rarityStyle = RARITY_STYLES[item.rarity] || RARITY_STYLES.COMMON;
  const IconComponent = ICON_MAP[item.icon] || Sparkles;
  const canAfford = userGold >= item.price;

  return (
    <div
      className={`relative bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border ${rarityStyle.border} rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col justify-between overflow-hidden backdrop-blur-md transition-all hover:scale-[1.01] min-w-0`}
    >
      {/* Ambient background glow */}
      <div className={`absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br ${rarityStyle.glow} blur-[50px] rounded-full pointer-events-none`} />

      <div className="min-w-0">
        {/* Top badges: Rarity & Type */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black tracking-wider uppercase border ${rarityStyle.badge}`}>
            {item.rarity}
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            {item.type}
          </span>
        </div>

        {/* Icon & Title */}
        <div className="flex items-start gap-3 sm:gap-4 mb-3 min-w-0">
          <div className={`p-3 sm:p-3.5 rounded-2xl bg-slate-950 border ${rarityStyle.border} ${rarityStyle.accent} shrink-0`}>
            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug break-words">
              {item.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Coins className="w-4 h-4 text-yellow-400 shrink-0" />
              <span className="text-sm font-extrabold text-yellow-300">{item.price}</span>
              <span className="text-xs font-semibold text-slate-500 uppercase">GOLD</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 leading-relaxed mb-6 break-words">
          {item.description}
        </p>
      </div>

      {/* Action CTA button */}
      <div>
        {isOwned ? (
          <button
            disabled
            aria-label={`${item.name} is already owned`}
            className="w-full min-h-[44px] py-2.5 px-4 bg-emerald-950/40 border border-emerald-600/50 text-emerald-300 font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-default"
          >
            <Check className="w-4 h-4" /> OWNED
          </button>
        ) : isPurchasing ? (
          <button
            disabled
            aria-label={`Purchasing ${item.name}...`}
            className="w-full min-h-[44px] py-2.5 px-4 bg-indigo-950/40 border border-indigo-700/50 text-indigo-300 font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-wait"
          >
            <Loader2 className="w-4 h-4 animate-spin" /> PURCHASING...
          </button>
        ) : canAfford ? (
          <button
            onClick={() => onPurchase(item)}
            aria-label={`Purchase ${item.name} for ${item.price} gold`}
            className="w-full min-h-[44px] py-2.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <Coins className="w-4 h-4" /> BUY — {item.price} GOLD
          </button>
        ) : (
          <button
            disabled
            aria-label={`Need ${item.price} gold to purchase ${item.name}`}
            className="w-full min-h-[44px] py-2.5 px-4 bg-slate-900 border border-slate-800 text-slate-500 font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-not-allowed"
          >
            NEED {item.price} GOLD
          </button>
        )}
      </div>
    </div>
  );
}
