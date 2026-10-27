import { create } from 'zustand';
import { XPTransaction, XPSourceType } from '@/types/app';
import { STORAGE_KEYS, saveItem, loadItem } from '@/services/persistence';

interface XPState {
  transactions: XPTransaction[];
  totalXP: number;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  awardXP: (sourceType: XPSourceType, sourceId: string, amount: number, reason: string) => boolean;
  hasBeenAwarded: (sourceType: XPSourceType, sourceId: string) => boolean;
  clearXP: () => Promise<void>;
}

export const useXPStore = create<XPState>((set, get) => ({
  transactions: [],
  totalXP: 0,
  isHydrated: false,

  hydrate: async () => {
    const saved = await loadItem<XPTransaction[]>(STORAGE_KEYS.XP, []);
    const total = saved.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    set({ transactions: saved, totalXP: total, isHydrated: true });
  },

  hasBeenAwarded: (sourceType, sourceId) => {
    return get().transactions.some(
      (tx) => tx.sourceType === sourceType && tx.sourceId === sourceId
    );
  },

  awardXP: (sourceType, sourceId, amount, reason) => {
    const existing = get().hasBeenAwarded(sourceType, sourceId);
    if (existing) {
      // Prevent double rewards
      return false;
    }

    const newTx: XPTransaction = {
      id: `xp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sourceType,
      sourceId,
      amount,
      reason,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTx, ...get().transactions];
    const newTotal = get().totalXP + amount;

    set({ transactions: updated, totalXP: newTotal });
    saveItem(STORAGE_KEYS.XP, updated);
    return true;
  },

  clearXP: async () => {
    set({ transactions: [], totalXP: 0 });
    await saveItem(STORAGE_KEYS.XP, []);
  },
}));
