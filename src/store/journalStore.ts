import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Season {
  id: string;
  name: string;
  cropType: string;
  area: number;
  startDate: string;
  expectedHarvestDays: number;
}

export interface JournalEntry {
  id: string;
  seasonId: string;
  date: string;
  activityType: 'fertilize' | 'spray' | 'water' | 'harvest' | 'other';
  note: string;
  cost: number;
  images: string[];
}

interface JournalState {
  seasons: Season[];
  entries: JournalEntry[];
  addSeason: (season: Season) => void;
  addEntry: (entry: JournalEntry) => void;
  deleteSeason: (id: string) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      seasons: [
        {
          id: '1',
          name: 'Lúa Đông Xuân 2026 - 5 Công',
          cropType: 'Lúa',
          area: 5000,
          startDate: '2026-01-10',
          expectedHarvestDays: 100,
        },
      ],
      entries: [
        {
          id: 'e1',
          seasonId: '1',
          date: '2026-01-20',
          activityType: 'fertilize',
          note: 'Bón phân thúc đợt 1 (Urê + DAP)',
          cost: 1200000,
          images: [],
        },
        {
          id: 'e2',
          seasonId: '1',
          date: '2026-02-15',
          activityType: 'spray',
          note: 'Xịt thuốc trừ sâu cuốn lá',
          cost: 450000,
          images: [],
        },
      ],
      addSeason: (season) => set((state) => ({ seasons: [...state.seasons, season] })),
      addEntry: (entry) => set((state) => ({ entries: [...state.entries, entry] })),
      deleteSeason: (id) =>
        set((state) => ({
          seasons: state.seasons.filter((s) => s.id !== id),
          entries: state.entries.filter((e) => e.seasonId !== id),
        })),
    }),
    {
      name: 'farming-journal-storage',
    }
  )
);
