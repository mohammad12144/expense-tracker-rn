import { create } from 'zustand';
import type { RatesClient } from '../services/api/rates';

export const CURRENCIES = ['EUR', 'GBP', 'JOD', 'ILS', 'SAR', 'AED', 'TRY', 'EGP'] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

const DEFAULT_TARGETS: CurrencyCode[] = ['EUR', 'GBP', 'JOD', 'ILS'];

interface PreferencesState {
  client: RatesClient;
  targets: CurrencyCode[];
  setClient: (client: RatesClient) => void;
  toggleTarget: (code: CurrencyCode) => void;
  reset: () => void;
}

export const usePreferences = create<PreferencesState>()((set) => ({
  client: 'axios',
  targets: DEFAULT_TARGETS,

  setClient: (client) => set({ client }),

  toggleTarget: (code) =>
    set((s) => {
      if (s.targets.includes(code)) {
        // Always keep at least one currency selected.
        if (s.targets.length === 1) return s;
        return { targets: s.targets.filter((c) => c !== code) };
      }
      // Keep the list in the same order as CURRENCIES.
      return { targets: CURRENCIES.filter((c) => c === code || s.targets.includes(c)) };
    }),

  reset: () => set({ client: 'axios', targets: DEFAULT_TARGETS }),
}));