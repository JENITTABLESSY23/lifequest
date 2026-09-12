import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, ShoppingBag, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { rewardService } from '../services/rewardService';
import RewardCard from '../components/RewardCard';
import PageTransition from '../components/PageTransition';
import { SkeletonRewardCard } from '../components/skeletons/SkeletonCard';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';

export default function Rewards() {
  const { user, token, updateUser } = useAuth();
  const toast = useToast();


  const [rewards, setRewards] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('SHOP'); // 'SHOP' | 'INVENTORY'
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'AVATAR' | 'THEME' | 'BADGE'
  const [purchasingId, setPurchasingId] = useState(null);

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const [shopData, invData] = await Promise.all([
        rewardService.getRewards(token),
        rewardService.getInventory(token),
      ]);
      if (shopData.rewards) setRewards(shopData.rewards);
      if (invData.inventory) setInventory(invData.inventory);
    } catch (err) {
      console.error('Error fetching rewards data:', err);
      setError(err.message || 'Failed to load shop');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handlePurchase = async (item) => {
    if (!token || purchasingId) return;
    try {
      setPurchasingId(item.id);
      setError(null);
      const data = await rewardService.purchaseReward(item.id, token);

      if (data.user) {
        updateUser(data.user);
      }

      // Add to local inventory state
      setInventory((prev) => [
        {
          itemId: item.id,
          name: item.name,
          description: item.description,
          type: item.type,
          rarity: item.rarity,
          icon: item.icon,
          price: item.price,
          purchasedAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      // Trigger unified reward toast
      toast.success(
        'Reward Unlocked!',
        `Purchased ${item.name} for ${item.price} Gold. (${data.gold ?? (user?.gold - item.price)} Gold remaining)`
      );
    } catch (err) {
      console.error('Purchase failed:', err);
      toast.error('Purchase Failed', err.message || 'Reward could not be purchased. Please try again.');
      setError(err.message || 'Reward could not be purchased. Please try again.');
    } finally {
      setPurchasingId(null);
    }
  };

  // Set of owned item IDs

  const ownedItemIds = new Set(inventory.map((inv) => inv.itemId));

  // Filter rewards by type
  const filteredRewards = rewards.filter((r) => {
    if (filterType === 'ALL') return true;
    return r.type === filterType;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-1/4 w-[700px] h-[350px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />

        {/* ── Top Navbar ───────────────────────────────────────── */}
        <Navbar activePage="rewards" />

        {/* ── Main Container ───────────────────────────────────── */}
        <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 z-10">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
                <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400" /> Reward Shop
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Spend your hard-earned Gold to customize your character and LifeQuest experience
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-1 rounded-xl text-sm font-bold">
              <button
                onClick={() => setActiveTab('SHOP')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                  activeTab === 'SHOP'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> Shop ({rewards.length})
              </button>
              <button
                onClick={() => setActiveTab('INVENTORY')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                  activeTab === 'INVENTORY'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" /> My Inventory ({inventory.length})
              </button>
            </div>
          </div>

          {/* Error Banner with Retry */}
          {error && (
            <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-sm flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchData}
                className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ── Tab: SHOP ───────────────────────────────────────── */}
          {activeTab === 'SHOP' && (
            <div className="space-y-6">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 text-sm font-semibold text-slate-400 no-scrollbar">
                {[
                  { id: 'ALL', label: 'All Items' },
                  { id: 'AVATAR', label: 'Avatars' },
                  { id: 'THEME', label: 'Themes' },
                  { id: 'BADGE', label: 'Badges' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition min-h-[44px] flex items-center ${
                      filterType === tab.id
                        ? 'bg-slate-800 text-amber-300 border border-amber-500/30'
                        : 'hover:bg-slate-900 hover:text-slate-200'
                    }`}

                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <SkeletonRewardCard />
                  <SkeletonRewardCard />
                  <SkeletonRewardCard />
                </div>
              ) : filteredRewards.length === 0 ? (
                <div className="text-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  No items found for this category.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRewards.map((item) => (
                    <RewardCard
                      key={item.id}
                      item={item}
                      isOwned={ownedItemIds.has(item.id)}
                      userGold={user?.gold ?? 0}
                      onPurchase={handlePurchase}
                      isPurchasing={purchasingId === item.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: MY INVENTORY ───────────────────────────────── */}
          {activeTab === 'INVENTORY' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800/80 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-400" /> Owned Items
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Items unlocked and stored securely in your MongoDB profile
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <SkeletonRewardCard />
                  <SkeletonRewardCard />
                  <SkeletonRewardCard />
                </div>
              ) : inventory.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/30 p-8 space-y-4">
                  <Package className="w-12 h-12 text-slate-600 mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Your Inventory is Empty</h3>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto">
                      Complete quests to earn Gold, then head to the Shop to unlock custom avatars, themes, and badges!
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('SHOP')}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-sm transition"
                  >
                    BROWSE REWARD SHOP
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inventory.map((inv) => (
                    <div
                      key={inv.itemId}
                      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-amber-300 uppercase">
                          {inv.rarity}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 uppercase">
                          {inv.type}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{inv.name}</h3>
                        <p className="text-sm text-slate-400">{inv.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4" /> OWNED
                        </span>
                        <span>
                          {inv.purchasedAt ? new Date(inv.purchasedAt).toLocaleDateString() : 'Active'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
}
